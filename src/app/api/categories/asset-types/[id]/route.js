// src/app/api/categories/asset-types/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CategoryAssetType from "@/lib/models/CategoryAssetType";
import { verifyAdmin } from "@/lib/auth";

// PUT: Mengupdate Tipe Aset
export async function PUT(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori tidak boleh kosong" },
        { status: 400 }
      );
    }

    await connectDB();

    // Cek duplikat, pastikan nama baru tidak sama dengan nama item lain
    const existing = await CategoryAssetType.findOne({
      name: new RegExp(`^${name}$`, "i"),
      _id: { $ne: id }, // $ne = Not Equal, kecualikan item yang sedang diedit
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Nama kategori tersebut sudah ada" },
        { status: 409 }
      );
    }

    const updatedAssetType = await CategoryAssetType.findByIdAndUpdate(
      id,
      { name },
      { new: true } // Opsi ini akan mengembalikan dokumen yang sudah diupdate
    );

    if (!updatedAssetType) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tipe Aset berhasil diperbarui",
      assetType: updatedAssetType,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus Tipe Aset
export async function DELETE(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    await connectDB();
    const deletedAssetType = await CategoryAssetType.findByIdAndDelete(
      params.id
    );

    if (!deletedAssetType) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tipe Aset berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
