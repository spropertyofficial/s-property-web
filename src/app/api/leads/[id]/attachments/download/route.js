import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyUser, verifyAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

function slugifyName(name) {
  if (!name) return "unknown";
  return name
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60)
    .toLowerCase() || "unknown";
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
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
    const folder = `leads/${slugifyName(doc.name)}`;
    const url = cloudinary.utils.download_folder(folder);
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    if (format !== 'json') {
      // Default: redirect to Cloudinary ZIP URL so we can use plain anchor on client
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ success:true, url });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal membuat URL unduh folder" }, { status:500 });
  }
}
