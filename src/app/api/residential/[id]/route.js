// /app/api/residential/[id]/route.js
import connectDB from "@/lib/mongodb";
import Residential from "@/lib/models/Residential";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const property = await Residential.findById(id).lean();

    if (!property) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data properti" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    const updated = await Residential.findByIdAndUpdate(id, body, {
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
    return NextResponse.json(
      { message: "Gagal memperbarui properti" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  await connectDB();

  try {
    const property = await Residential.findById(id);

    if (!property) {
      return NextResponse.json(
        { error: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate folder path
    const folderName = property.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const folderPath = `s-property/residential/${folderName}`;

    // Hapus semua resources dengan prefix folder ini
    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      // Hapus folder setelah semua resources dihapus
      await cloudinary.api.delete_folder(folderPath);
    } catch (cloudinaryError) {
      console.warn(`Gagal menghapus dari Cloudinary:`, cloudinaryError.message);
    }

    // Hapus dari database
    await Residential.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus properti" },
      { status: 500 }
    );
  }
}
