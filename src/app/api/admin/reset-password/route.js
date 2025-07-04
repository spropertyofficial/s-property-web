// src/app/api/admin/reset-password/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth";

export async function POST(req) {
  try {
    // 1. Verifikasi & Otorisasi: Hanya superadmin yang boleh
    const { success, admin: requester, error } = await verifyAdmin(req);
    if (!success || requester.role !== "superadmin") {
      return NextResponse.json(
        { message: error || "Akses Ditolak" },
        { status: 403 }
      );
    }

    // 2. Ambil data dari body
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { message: "User ID dan password baru diperlukan" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password minimal harus 6 karakter" },
        { status: 400 }
      );
    }

    // 3. Cari user yang akan diupdate
    await connectDB();
    const userToUpdate = await Admin.findById(userId);

    if (!userToUpdate) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // 4. Hash password baru dan simpan
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userToUpdate.password = hashedPassword;
    await userToUpdate.save();

    return NextResponse.json({
      message: `Password untuk user ${userToUpdate.email} berhasil direset.`,
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
