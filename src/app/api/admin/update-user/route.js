// src/app/api/admin/update-user/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
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

    // 2. Ambil data yang BENAR dari body request
    const { userId, name, role } = await req.json();

    if (!userId || !name || !role) {
      return NextResponse.json(
        { message: "Data tidak lengkap (membutuhkan userId, name, dan role)" },
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

    // 4. Update field yang relevan dan simpan
    userToUpdate.name = name;
    userToUpdate.role = role;
    // Kita tidak mengizinkan perubahan email di sini untuk keamanan

    await userToUpdate.save();

    return NextResponse.json({
      message: `Data untuk user ${userToUpdate.email} berhasil diperbarui.`,
    });
  } catch (err) {
    // Berikan log error yang lebih detail di server untuk debugging
    console.error("Update user error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
