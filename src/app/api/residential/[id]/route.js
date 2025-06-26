// /app/api/residential/[id]/route.js

import connectDB from "@/lib/mongodb";
import Residential from "@/lib/models/Residential";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/auth"; // <-- Impor helper verifikasi kita

// Mengambil satu properti berdasarkan ID
export async function GET(req, { params }) {
  try {
    // 1. Amankan endpoint
    const { success, error } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: error }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    // 2. Tambahkan .populate() untuk mengambil nama admin
    const property = await Residential.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .lean();

    if (!property) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(property, { success: true });
  } catch (error) {
    console.error("GET by ID error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data properti" },
      { status: 500 }
    );
  }
}

// Mengupdate properti berdasarkan ID
export async function PUT(req, { params }) {
  try {
    // 1. Verifikasi admin yang melakukan update
    const { success, admin, error } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: error }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // 2. Siapkan data update, dan sisipkan 'updatedBy' secara otomatis
    const updateData = {
      ...body,
      updatedBy: admin._id, // Set ID admin yang sedang mengedit
    };

    // 3. Update data di database
    await connectDB();
    const updated = await Residential.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Properti berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui properti" },
      { status: 500 }
    );
  }
}

// Menghapus properti berdasarkan ID
export async function DELETE(req, { params }) {
  try {
    // 1. Amankan endpoint hapus
    const { success, admin, error } = await verifyAdmin(req);
    // Optional: Anda bisa menambahkan cek role di sini, misal: if (admin.role !== 'superadmin')
    if (!success) {
      return NextResponse.json({ message: error }, { status: 401 });
    }

    const { id } = params;
    await connectDB();
    const property = await Residential.findById(id);

    if (!property) {
      return NextResponse.json(
        { error: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    // ... sisa logika hapus Cloudinary Anda (sudah benar) ...
    const folderName = property.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const folderPath = `s-property/residential/${folderName}`;
    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      await cloudinary.api.delete_folder(folderPath);
    } catch (cloudinaryError) {
      console.warn(`Gagal menghapus dari Cloudinary:`, cloudinaryError.message);
    }

    await Residential.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Properti berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus properti" },
      { status: 500 }
    );
  }
}
