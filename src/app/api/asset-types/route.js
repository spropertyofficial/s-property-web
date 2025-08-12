import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CategoryAssetType from "@/lib/models/CategoryAssetType";

// GET /api/asset-types
export async function GET() {
  try {
    await connectDB();
    const items = await CategoryAssetType.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET /api/asset-types error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil tipe aset" }, { status: 500 });
  }
}
