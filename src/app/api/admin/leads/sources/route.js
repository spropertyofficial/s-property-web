import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/auth";
import Lead from "@/lib/models/Lead";

export async function GET(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });
    }
    await dbConnect();
    const raw = await Lead.distinct("source", { source: { $exists: true, $ne: "" } });
    // Normalize, dedupe, sort
    const items = Array.from(new Set((raw || []).map(s => String(s).trim()).filter(Boolean))).sort((a,b)=> a.localeCompare(b));
    return NextResponse.json({ success: true, items });
  } catch (e) {
    console.error("admin leads sources error", e);
    return NextResponse.json({ success: false, error: "Gagal mengambil sumber" }, { status: 500 });
  }
}
