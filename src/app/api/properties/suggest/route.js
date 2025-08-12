import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/auth";
import Property from "@/lib/models/Property";

export async function GET(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 10));
    if (q.length < 2) return NextResponse.json({ success: true, items: [] });

    const items = await Property.find({ name: { $regex: q, $options: "i" } })
      .select("name assetType")
      .limit(limit)
      .lean();

    const result = items.map((p) => ({ _id: p._id, name: p.name, assetTypeId: p.assetType || null }));
    return NextResponse.json({ success: true, items: result });
  } catch (error) {
    console.error("GET /api/properties/suggest error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil saran properti" }, { status: 500 });
  }
}
