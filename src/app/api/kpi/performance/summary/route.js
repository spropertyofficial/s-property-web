import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SaleRecord from "@/lib/models/SaleRecord";

// GET /api/kpi/performance/summary?period=YYYY-MM&agentId=&projectId=
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period"); // YYYY-MM
    const agentId = searchParams.get("agentId");
    const projectId = searchParams.get("projectId");

    if (!period) {
      return NextResponse.json({ success: false, error: "parameter period (YYYY-MM) wajib" }, { status: 400 });
    }

    const [y, m] = period.split("-").map(Number);
    if (!y || !m) {
      return NextResponse.json({ success: false, error: "format period tidak valid" }, { status: 400 });
    }

    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));

  const filter = { status: "Closing", tanggalClosing: { $gte: start, $lt: end } };
    if (agentId) filter.agentId = agentId;
    if (projectId) filter.projectId = projectId;

    const rows = await SaleRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
          unitTerjual: { $sum: 1 },
        },
      },
    ]);

    const agg = rows[0] || { pendapatanTotal: 0, unitTerjual: 0 };
    const hargaRata2 = agg.unitTerjual > 0 ? agg.pendapatanTotal / agg.unitTerjual : 0;

    return NextResponse.json({
      success: true,
      period,
      pendapatanTotal: agg.pendapatanTotal,
      unitTerjual: agg.unitTerjual,
      hargaRata2,
    });
  } catch (error) {
    console.error("GET /api/kpi/performance/summary error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghitung KPI" }, { status: 500 });
  }
}
