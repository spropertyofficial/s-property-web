import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SaleRecord from "@/lib/models/SaleRecord";

// GET /api/kpi/performance/leaderboard?period=YYYY-MM&topN=10&projectId=
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    const topN = Math.min(100, Math.max(1, Number(searchParams.get("topN")) || 10));
    const projectId = searchParams.get("projectId");

    if (!period) {
      return NextResponse.json({ success: false, error: "parameter period (YYYY-MM) wajib" }, { status: 400 });
    }
    const [y, m] = period.split("-").map(Number);
    if (!y || !m) {
      return NextResponse.json({ success: false, error: "format period tidak valid" }, { status: 400 });
    }

    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 1));

  const match = { status: "Closing", tanggalClosing: { $gte: start, $lt: end } };
    if (projectId) match.projectId = projectId;

    const rows = await SaleRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$agentId",
          pendapatanTotal: { $sum: "$hargaPropertiTerjual" },
          unitTerjual: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: { path: "$agent", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          agentName: "$agent.name",
          agentCode: "$agent.agentCode",
        },
      },
      { $project: { agent: 0 } },
      {
        $sort: {
          pendapatanTotal: -1,
          unitTerjual: -1,
          agentName: 1,
        },
      },
      { $limit: topN },
    ]);

    // Tambahkan rank 1..N
    const leaderboard = rows.map((r, i) => ({
      rank: i + 1,
      agentId: r._id,
      agentName: r.agentName || "-",
      agentCode: r.agentCode || "-",
      pendapatanTotal: r.pendapatanTotal,
      unitTerjual: r.unitTerjual,
    }));

    return NextResponse.json({ success: true, period, topN, leaderboard });
  } catch (error) {
    console.error("GET /api/kpi/performance/leaderboard error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat leaderboard" }, { status: 500 });
  }
}
