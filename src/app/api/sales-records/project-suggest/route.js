import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SaleRecord from "@/lib/models/SaleRecord";

// GET /api/sales-records/project-suggest?q=
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, items: [] });
    }
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const rows = await SaleRecord.aggregate([
      { $match: { projectName: { $regex: regex } } },
      { $group: { _id: "$projectName" } },
      { $sort: { _id: 1 } },
      { $limit: 10 },
    ]);
    const items = rows.map((r) => r._id).filter(Boolean);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET /api/sales-records/project-suggest error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil saran proyek" }, { status: 500 });
  }
}
