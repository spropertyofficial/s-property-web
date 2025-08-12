import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdminWithRole } from "@/lib/auth";
import SaleRecord from "@/lib/models/SaleRecord";
// Register referenced models for populate on Vercel/Node runtime
import "@/lib/models/Property";
import "@/lib/models/User";

// Ensure Node.js runtime and no static caching in Vercel
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET /api/sales-records
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const status = searchParams.get("status");
    const period = searchParams.get("period"); // YYYY-MM
    const agentId = searchParams.get("agentId");
    const projectId = searchParams.get("projectId");
    const projectName = searchParams.get("projectName");
  const assetTypeId = searchParams.get("assetTypeId");
    const q = searchParams.get("q"); // free text search on projectName/block/unitType/notes

    const filter = {};
    if (status) filter.status = status;
    if (agentId) filter.agentId = agentId;
    if (projectId) filter.projectId = projectId;
    if (projectName) filter.projectName = { $regex: projectName, $options: "i" };
  if (assetTypeId) filter.assetTypeId = assetTypeId;
    if (period) {
      try {
        const [ys, ms] = period.split("-");
        const y = parseInt(ys, 10);
        const m = parseInt(ms, 10);
        if (Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12) {
          const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
          const end = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
          filter.tanggalClosing = { $gte: start, $lt: end };
        }
      } catch {}
    }
    if (q) {
      filter.$or = [
        { projectName: { $regex: q, $options: "i" } },
        { block: { $regex: q, $options: "i" } },
        { unitType: { $regex: q, $options: "i" } },
        { notes: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SaleRecord.find(filter)
        .sort({ tanggalClosing: -1, createdAt: -1 })
        .populate({ path: "agentId", select: "name agentCode" })
        .populate({ path: "projectId", select: "name" })
        .skip(skip)
        .limit(limit)
        .lean(),
      SaleRecord.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      items,
      page,
      limit,
      total,
      pageCount: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/sales-records error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json({ success: false, error: "Gagal mengambil data penjualan" }, { status: 500 });
  }
}

// POST /api/sales-records (admin-only)
export async function POST(req) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;
    await connectDB();
    const body = await req.json();
    const {
      agentId,
      projectId,
      projectName,
      block,
      unitType,
      tanggalClosing,
    hargaPropertiTerjual,
  status = "Closing",
  assetTypeId,
      notes,
      attachments = [],
    } = body;

    if (!agentId) return NextResponse.json({ success: false, error: "agentId wajib" }, { status: 400 });
    if (!projectId && !projectName) {
      return NextResponse.json({ success: false, error: "projectName wajib jika projectId kosong" }, { status: 400 });
    }
    if (!(hargaPropertiTerjual >= 0)) {
      return NextResponse.json({ success: false, error: "hargaPropertiTerjual harus >= 0" }, { status: 400 });
    }
    if (status === "Closing" && !tanggalClosing) {
      return NextResponse.json({ success: false, error: "tanggalClosing wajib untuk status Closing" }, { status: 400 });
    }
    if (!["Closing", "Cancelled"].includes(status)) {
      return NextResponse.json({ success: false, error: "Status tidak valid" }, { status: 400 });
    }

    // Normalize attachments
    const atts = Array.isArray(attachments)
      ? attachments
          .map((a) => ({
            url: a?.url || a?.src,
            publicId: a?.publicId,
            size: a?.size,
            mimeType: a?.mimeType,
            width: a?.width,
            height: a?.height,
          }))
          .filter((a) => !!a.url)
      : [];

    const doc = await SaleRecord.create({
      agentId,
      projectId: projectId || undefined,
      projectName: projectId ? undefined : (projectName || "").trim(),
      block: block?.trim(),
      unitType: unitType?.trim(),
      tanggalClosing: tanggalClosing ? new Date(tanggalClosing) : undefined,
      hargaPropertiTerjual: Number(hargaPropertiTerjual),
      status,
  assetTypeId: assetTypeId || undefined,
      notes: notes?.trim(),
      attachments: atts,
  createdBy: auth.admin._id,
    });

    return NextResponse.json({ success: true, record: doc });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      const message = error.errors[firstKey]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error("POST /api/sales-records error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan data penjualan" }, { status: 500 });
  }
}