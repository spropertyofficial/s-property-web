import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyUser, verifyAdmin } from "@/lib/auth";
import { getUserConversationalScope } from "@/lib/team-helpers";

async function findAccessibleLead(id, req) {
  const adminAuth = await verifyAdmin(req);
  if (adminAuth.success) {
    return { doc: await Lead.findById(id), admin: true, userId: null };
  }
  const userAuth = await verifyUser(req);
  if (!userAuth.success) return { doc: null, admin: false, userId: null };

  // Cek apakah user adalah leader (punya scope lebih dari 1 agent)
  const agentScope = await getUserConversationalScope(userAuth.user._id);
  if (agentScope.length > 1) {
    // Leader: bisa akses semua lead dalam scope
    const doc = await Lead.findOne({ _id: id, agent: { $in: agentScope } });
    return { doc, admin: false, userId: userAuth.user._id };
  }
  // Agent biasa: hanya lead milik sendiri
  const doc = await Lead.findOne({ _id: id, agent: userAuth.user._id });
  return { doc, admin: false, userId: userAuth.user._id };
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { doc } = await findAccessibleLead(id, req);
    if (!doc) return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
    // Populate property name if referenced
    if (doc.populate) {
      const paths = [];
      if (doc.property) paths.push({ path: 'property', select: 'name' });
      if (doc.agent) paths.push({ path: 'agent', select: 'name agentCode' });
      if (paths.length) await doc.populate(paths);
    }
    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Gagal mengambil lead" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { doc } = await findAccessibleLead(id, req);
    if (!doc) return NextResponse.json({ success: false, error: "Lead tidak ditemukan / akses ditolak" }, { status: 404 });

    const body = await req.json();
    const allowed = [
      "name","contact","email","property","propertyName","unit","source","umur","pekerjaan","statusPernikahan","anggaran","tujuanMembeli","caraPembayaran","lokasiKlien","lokasiDiinginkan","minatKlien","kerabat","catatan"
    ];
    let modified = false;
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        doc[key] = body[key];
        modified = true;
      }
    }
    if (!modified) {
      return NextResponse.json({ success: false, error: "Tidak ada perubahan" }, { status: 400 });
    }
    await doc.save();
    return NextResponse.json({ success: true, data: doc, message: "Lead diperbarui" });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return NextResponse.json(
        { success: false, error: `${field} sudah terpakai untuk lead aktif lain` },
        { status: 409 }
      );
    }
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      return NextResponse.json({ success: false, error: error.errors[firstKey]?.message || "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Gagal memperbarui lead" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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
    await doc.deleteOne();
    return NextResponse.json({ success:true, message:"Lead dihapus" });
  } catch (e) {
    return NextResponse.json({ success:false, error:"Gagal menghapus lead" }, { status:500 });
  }
}
