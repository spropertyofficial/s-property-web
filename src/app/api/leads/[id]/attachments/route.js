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
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60) // limit length
    .toLowerCase() || "unknown";
}

function slugifyId(text) {
  if (!text) return "file";
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
    .toLowerCase() || "file";
}

// POST /api/leads/[id]/attachments  (deferred Cloudinary upload meta)
export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const adminAuth = await verifyAdmin(req);
    let userAuth = null;
    let filter = { _id: id };
    if (!adminAuth.success) {
      userAuth = await verifyUser(req);
      if (!userAuth.success) return NextResponse.json({ success:false, error:"Akses ditolak" }, { status:401 });
      filter.agent = userAuth.user._id;
    }

    let isMultipart = false;
    let title, url, publicId, size, mimeType;
    const contentType = req.headers.get('content-type') || '';

    // We need the lead document early for folder naming
    const doc = await Lead.findOne(filter);
    if (!doc) return NextResponse.json({ success:false, error:"Lead tidak ditemukan" }, { status:404 });
    const folderBase = slugifyName(doc.name);
    const folderPath = `leads/${folderBase}`; // per-lead folder

    if (contentType.startsWith('multipart/form-data')) {
      isMultipart = true;
      const form = await req.formData();
      title = (form.get('title') || '').toString();
      const file = form.get('file');
      if (!title || !file) {
        return NextResponse.json({ success:false, error:"title dan file wajib" }, { status:400 });
      }
      // Cloudinary upload to dynamic folder with explicit public_id from title
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadRes = await new Promise((resolve, reject)=> {
        const stream = cloudinary.uploader.upload_stream({
          folder: folderPath,
          public_id: slugifyId(title),
          unique_filename: false,
          resource_type: 'auto',
          overwrite: false,
        }, (err, result)=> {
          if (err) reject(err); else resolve(result);
        });
        stream.end(buffer);
      });
      url = uploadRes.secure_url;
      publicId = uploadRes.public_id;
      size = buffer.length;
      mimeType = file.type;
    } else {
      // JSON mode (link/manual) - allow specifying url, optional publicId (should already exist)
      const body = await req.json();
      ({ title, url, publicId, size, mimeType } = body || {});
      if (!title || !url) {
        return NextResponse.json({ success:false, error:"title dan url wajib" }, { status:400 });
      }
    }

  doc.attachments.push({ title: title.trim(), url: url.trim(), publicId, size, mimeType, uploadedBy: (userAuth?.user?._id || adminAuth?.admin?._id) });
    await doc.save();

    return NextResponse.json({ success:true, data: doc.attachments, message:"Lampiran ditambahkan" });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal menambah lampiran" }, { status:500 });
  }
}
