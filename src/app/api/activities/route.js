import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import { verifyAdmin } from "@/lib/auth";

// GET: Mengambil log aktivitas
export async function GET(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    await connectDB();

    let logs;
    // Jika superadmin, ambil semua log yang 'Pending' untuk divalidasi
    if (admin.role === "superadmin") {
      logs = await ActivityLog.find({ status: "Pending" })
        .populate("agent", "name") // Ambil nama agen
        .sort({ date: -1 });
    } else {
      // Jika bukan superadmin, hanya ambil log milik sendiri
      logs = await ActivityLog.find({ agent: admin._id }).sort({ date: -1 });
    }

    return NextResponse.json({ success: true, activities: logs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data aktivitas" },
      { status: 500 }
    );
  }
}

// POST: Agen membuat log aktivitas baru
export async function POST(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { activityType, date, notes } = await req.json();

    if (!activityType || !date) {
      return NextResponse.json(
        { success: false, error: "Jenis aktivitas dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    await connectDB();

    const newLog = new ActivityLog({
      agent: admin._id,
      activityType,
      date,
      notes,
      status: "Pending", // Status default saat dibuat
    });

    await newLog.save();

    return NextResponse.json({
      success: true,
      message: "Aktivitas berhasil dicatat dan menunggu validasi.",
      log: newLog,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
