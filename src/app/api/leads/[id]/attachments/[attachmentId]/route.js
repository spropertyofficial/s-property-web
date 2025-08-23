import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyUser, verifyAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id, attachmentId } = params;
    const adminAuth = await verifyAdmin(req);
    let userAuth = null;
    let filter = { _id: id };
    if (!adminAuth.success) {
      userAuth = await verifyUser(req);
      if (!userAuth.success) return NextResponse.json({ success:false, error:"Akses ditolak" }, { status:401 });
      filter.agent = userAuth.user._id;
    }

    const doc = await Lead.findOne(filter);
    if (!doc) return NextResponse.json({ success:false, error:"Lead tidak ditemukan" }, { status:404 });
    let att = doc.attachments.id(attachmentId);
    if (!att) {
      // Fallback: treat attachmentId as index if numeric
      const idx = Number.isInteger(Number(attachmentId)) ? Number(attachmentId) : -1;
      if (idx >= 0 && idx < doc.attachments.length) {
        att = doc.attachments[idx];
      }
    }
    if (!att) return NextResponse.json({ success:false, error:"Lampiran tidak ditemukan" }, { status:404 });

    if (att.publicId) {
      try { await cloudinary.uploader.destroy(att.publicId); } catch (e) { console.warn('Cloudinary delete fail', e?.message); }
    }

    // Remove using pull if no id helper (legacy without _id)
    if (att._id) {
      att.deleteOne();
    } else {
      doc.attachments = doc.attachments.filter(a => a !== att);
    }
    await doc.save();
    return NextResponse.json({ success:true, data: doc.attachments, message:"Lampiran dihapus" });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal menghapus lampiran" }, { status:500 });
  }
}
