import { NextResponse } from "next/server";
export const runtime = 'nodejs';
import connectDB from "@/lib/mongodb";
import { verifyAdminWithRole } from "@/lib/auth";
import SaleRecord from "@/lib/models/SaleRecord";
import CategoryAssetType from "@/lib/models/CategoryAssetType";
import * as XLSX from "xlsx";

function parseMonthRange(start, end) {
  if (!start || !end) return null;
  const [ys, ms] = start.split("-").map(Number);
  const [ye, me] = end.split("-").map(Number);
  if (!ys || !ms || !ye || !me) return null;
  const s = new Date(Date.UTC(ys, ms - 1, 1));
  const e = new Date(Date.UTC(ye, me, 1)); // exclusive
  return { s, e, start, end };
}

async function fetchDetail(match) {
  const rows = await SaleRecord.find(match)
    .populate({ path: "agentId", select: "name agentCode" })
    .populate({ path: "assetTypeId", select: "name" })
    .sort({ tanggalClosing: 1 })
    .lean();
  return rows.map((r) => ({
    Tanggal: r.tanggalClosing ? new Date(r.tanggalClosing).toISOString().slice(0, 10) : "",
    Agen: r.agentId?.name || "",
    KodeAgen: r.agentId?.agentCode || "",
    Proyek: r.projectName || "",
    Block: r.block || "",
    TipeUnit: r.unitType || "",
    TipeAset: r.assetTypeId?.name || "-",
    Harga: r.hargaPropertiTerjual || 0,
    Catatan: r.notes || "",
  }));
}

async function fetchRekap(match) {
  const rows = await SaleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$tanggalClosing", timezone: "UTC" } },
        Pendapatan: { $sum: "$hargaPropertiTerjual" },
        Unit: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((r) => ({ Bulan: r._id, Pendapatan: r.Pendapatan, Unit: r.Unit }));
}

async function fetchKomposisi(match) {
  const rows = await SaleRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$assetTypeId",
        Pendapatan: { $sum: "$hargaPropertiTerjual" },
        Unit: { $sum: 1 },
      },
    },
    { $sort: { Pendapatan: -1 } },
  ]);
  const ids = rows.map((r) => r._id).filter(Boolean);
  const types = await CategoryAssetType.find({ _id: { $in: ids } }).lean();
  const map = new Map(types.map((t) => [String(t._id), t.name]));
  return rows.map((r) => ({ TipeAset: map.get(String(r._id)) || "(Tidak diisi)", Pendapatan: r.Pendapatan, Unit: r.Unit }));
}

export async function GET(req) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "all").toLowerCase(); // all|detail|rekap|komposisi
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const range = parseMonthRange(start, end);
    if (!range) return NextResponse.json({ success: false, error: "start/end tidak valid" }, { status: 400 });

    const match = { status: "Closed", tanggalClosing: { $gte: range.s, $lt: range.e } };

    const wb = XLSX.utils.book_new();

    if (type === "all" || type === "detail") {
      const detail = await fetchDetail(match);
      const ws = XLSX.utils.json_to_sheet(detail);
      XLSX.utils.book_append_sheet(wb, ws, "Detail");
    }
    if (type === "all" || type === "rekap") {
      const rekap = await fetchRekap(match);
      const ws = XLSX.utils.json_to_sheet(rekap);
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
    }
    if (type === "all" || type === "komposisi") {
      const kompos = await fetchKomposisi(match);
      const ws = XLSX.utils.json_to_sheet(kompos);
      XLSX.utils.book_append_sheet(wb, ws, "Komposisi Tipe Aset");
    }

    // Catatan: Menyematkan grafik di XLSX secara programatik tidak didukung oleh xlsx (SheetJS) open-source.
    // Sebagai alternatif, pengguna dapat membuat chart langsung di Excel dari sheet Rekap/Komposisi.

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const filename = `kpi-performance_${range.start}_${range.end}_${type}.xlsx`;
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/sales-records/export-xlsx error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat file Excel" }, { status: 500 });
  }
}
