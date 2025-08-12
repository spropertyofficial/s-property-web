import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SaleRecord from "@/lib/models/SaleRecord";

// GET /api/kpi/performance/trend?period=YYYY-MM OR ?start=YYYY-MM&end=YYYY-MM
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    let start, end;
    if (startParam && endParam) {
      const [ys, ms] = startParam.split("-").map(Number);
      const [ye, me] = endParam.split("-").map(Number);
      if (!ys || !ms || !ye || !me) {
        return NextResponse.json({ success: false, error: "format start/end tidak valid" }, { status: 400 });
      }
      start = new Date(Date.UTC(ys, ms - 1, 1));
      end = new Date(Date.UTC(ye, me, 1)); // exclusive
    } else if (period) {
      const [y, m] = period.split("-").map(Number);
      if (!y || !m) {
        return NextResponse.json({ success: false, error: "format period tidak valid" }, { status: 400 });
      }
      start = new Date(Date.UTC(y, m - 1, 1));
      end = new Date(Date.UTC(y, m, 1));
    } else {
      return NextResponse.json({ success: false, error: "wajib period atau start+end" }, { status: 400 });
    }

    const match = { status: "Closed", tanggalClosing: { $gte: start, $lt: end } };

    const rows = await SaleRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$tanggalClosing", timezone: "UTC" } },
          pendapatan: { $sum: "$hargaPropertiTerjual" },
          unit: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build month labels from start..end-1 month
    const labels = [];
    const map = new Map(rows.map((r) => [r._id, r.pendapatan]));
    const sY = start.getUTCFullYear();
    const sM = start.getUTCMonth();
    const eY = end.getUTCFullYear();
    const eM = end.getUTCMonth();
    let y = sY, m = sM;
    while (y < eY || (y === eY && m < eM)) {
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      labels.push(key);
      m += 1;
      if (m > 11) { m = 0; y += 1; }
    }
    const pendapatan = labels.map((k) => map.get(k) || 0);

    return NextResponse.json({ success: true, start: labels[0], end: labels[labels.length - 1], labels, pendapatan });
  } catch (error) {
    console.error("GET /api/kpi/performance/trend error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat tren" }, { status: 500 });
  }
}
