// src/app/api/admin/delete-user/[id]/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { verifyAdmin } from "@/lib/auth";

// Ganti nama fungsi dari POST menjadi DELETE
// Tambahkan { params } untuk menangkap ID dari URL
export async function DELETE(req, { params }) {
  try {
    // 1. Verifikasi siapa yang melakukan request
    const { success, admin: requester, error } = await verifyAdmin(req);

    // 2. Otorisasi: Hanya superadmin yang boleh menghapus
    if (!success || requester.role !== "superadmin") {
      return NextResponse.json(
        { message: error || "Akses Ditolak" },
        { status: 403 }
      );
    }

    // 3. Ambil ID user dari parameter URL, bukan dari body
    const { id: userId } = params;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID diperlukan" },
        { status: 400 }
      );
    }

    // 4. Aturan keamanan: Superadmin tidak boleh menghapus dirinya sendiri
    if (requester._id.toString() === userId) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    // 5. Cari dan hapus user
    await connectDB();
    const deletedUser = await Admin.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `User ${deletedUser.email} berhasil dihapus.`,
    });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
