// src/app/api/categories/asset-types/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CategoryMarketStatus from "@/lib/models/CategoryMarketStatus";
import { verifyAdmin } from "@/lib/auth";

// GET: Mengambil semua Tipe Aset
export async function GET() {
  try {
    await connectDB();
    const marketStatus = await CategoryMarketStatus.find().sort({ name: 1 });
    return NextResponse.json({ success: true, marketStatus });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// POST: Membuat Tipe Aset baru
export async function POST(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori harus diisi" },
        { status: 400 }
      );
    }

    await connectDB();

    // Cek duplikat (case-insensitive)
    const existing = await CategoryMarketStatus.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Nama kategori sudah ada" },
        { status: 409 }
      );
    }

    const newAssetType = new CategoryMarketStatus({ name });
    await newAssetType.save();

    return NextResponse.json({
      success: true,
      message: "Tipe Aset berhasil ditambahkan",
      assetType: newAssetType,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
