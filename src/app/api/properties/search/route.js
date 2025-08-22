import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/lib/models/Property";
import { verifyUser, verifyAdmin } from "@/lib/auth";

export async function GET(req) {
  try {
    // Basic auth: any logged user or admin
    const adminAuth = await verifyAdmin(req);
    let userAuth = null;
    if (!adminAuth.success) {
      userAuth = await verifyUser(req);
      if (!userAuth.success) return NextResponse.json({ success:false, error:"Akses ditolak" }, { status:401 });
    }
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ success:true, data: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');
    const items = await Property.find({ name: regex }).select('_id name').limit(8).lean();
    return NextResponse.json({ success:true, data: items });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal mencari properti" }, { status:500 });
  }
}
