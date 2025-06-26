// src/app/api/admin/create/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { verifyAdmin } from "@/lib/auth";

export async function POST(req) {
  try {
    // 1. Verifikasi admin yang sedang login dengan satu baris
    const { success, admin, error } = await verifyAdmin(req);

    // 2. Periksa apakah verifikasi berhasil dan rolenya adalah superadmin
    if (!success || admin.role !== "superadmin") {
      return NextResponse.json(
        { message: error || "Akses Ditolak: Butuh Superadmin" },
        { status: 403 }
      );
    }

    // 3. Ambil data dari body
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "Lengkapi semua field" },
        { status: 400 }
      );
    }

    // 4. Proses pembuatan user baru (kode Anda sudah benar)
    await connectDB();
    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return NextResponse.json({ message: "User berhasil dibuat" });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
