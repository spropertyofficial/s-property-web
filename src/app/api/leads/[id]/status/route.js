import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyUser, verifyAdmin } from "@/lib/auth";

const ALLOWED = ["Baru","Hot","Warm","Cold","Reservasi","Booking","Closing","No Respond"];

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } =  await params;

    const adminAuth = await verifyAdmin(req);
    let userAuth = null;
    let filter = { _id: id };
    if (!adminAuth.success) {
      userAuth = await verifyUser(req);
      if (!userAuth.success) return NextResponse.json({ success:false, error:"Akses ditolak" }, { status:401 });
      filter.agent = userAuth.user._id;
    }

    const body = await req.json();
    const nextStatus = body?.status;
    if (!ALLOWED.includes(nextStatus)) {
      return NextResponse.json({ success:false, error:"Status tidak valid" }, { status:400 });
    }

    const doc = await Lead.findOne(filter);
    if (!doc) return NextResponse.json({ success:false, error:"Lead tidak ditemukan" }, { status:404 });

    const prev = doc.status;
    if (prev === nextStatus) {
      return NextResponse.json({ success:true, data: doc, message:"Status tidak berubah" });
    }

    doc.status = nextStatus;

    // TODO: if nextStatus === 'Closing' create SaleRecord automatically (future)

    await doc.save();
    return NextResponse.json({ success:true, data: doc, message:"Status diperbarui" });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal memperbarui status" }, { status:500 });
  }
}
