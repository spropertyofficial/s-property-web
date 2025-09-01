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
    // If user is sales-inhouse, restrict strictly to allowedProperties (empty list yields no results)
    let baseFilter = { name: regex };
    const agentUser = userAuth?.user;
    if (userAuth?.success && agentUser?.type === 'sales-inhouse') {
      const list = Array.isArray(agentUser.allowedProperties) ? agentUser.allowedProperties : [];
      baseFilter._id = { $in: list };
    }
    const items = await Property.find(baseFilter).select('_id name').limit(8).lean();
    return NextResponse.json({ success:true, data: items });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal mencari properti" }, { status:500 });
  }
}
