import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityType from "@/lib/models/ActivityType";
import { verifyAdmin } from "@/lib/auth";

// GET: list activity types (only active for non-admin)
export async function GET(req) {
  try {
    await connectDB();

    // Try admin; if not admin, return only active
    const adminAuth = await verifyAdmin(req);
    const query = adminAuth.success ? {} : { isActive: true };
    const items = await ActivityType.find(query).sort({ isActive: -1, name: 1 });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data aktivitas" },
      { status: 500 }
    );
  }
}

// POST: create new activity type (admin only)
export async function POST(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { name, score, isActive = true, description } = body;
    if (!name || score === undefined) {
      return NextResponse.json(
        { success: false, error: "Nama dan skor wajib diisi" },
        { status: 400 }
      );
    }

    await connectDB();
    const exists = await ActivityType.findOne({ name: name.trim() });
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Nama aktivitas sudah digunakan" },
        { status: 400 }
      );
    }

    const item = new ActivityType({
      name: name.trim(),
      score: Number(score) || 0,
      isActive: !!isActive,
      description: description?.trim(),
      createdBy: adminAuth.admin._id,
      updatedBy: adminAuth.admin._id,
    });
    await item.save();
    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const key = Object.keys(error.errors)[0];
      const message = error.errors[key]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
