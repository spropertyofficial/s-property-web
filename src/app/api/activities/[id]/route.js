import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import { verifyAdmin } from "@/lib/auth";

// PUT: Admin memvalidasi (approve/reject) sebuah log
export async function PUT(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    // Hanya superadmin yang boleh memvalidasi
    if (!success || admin.role !== "superadmin") {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 403 }
      );
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedLog = await ActivityLog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLog) {
      return NextResponse.json(
        { success: false, error: "Log aktivitas tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Aktivitas berhasil di-${status.toLowerCase()}`,
      log: updatedLog,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
