import connectDB from "@/lib/mongodb";
import RegionCityImage from "@/lib/models/RegionCityImage";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// GET: Ambil region/city image berdasarkan ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const image = await RegionCityImage.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .lean();

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Error fetching region/city image:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT: Update region/city image
export async function PUT(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existingImage = await RegionCityImage.findById(id);
    if (!existingImage) {
      return NextResponse.json(
        { success: false, error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate slug baru jika nama berubah
    let slug = existingImage.slug;
    if (body.name && body.name !== existingImage.name) {
      slug = body.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");
      
      // Cek apakah slug baru sudah ada
      const existingSlug = await RegionCityImage.findOne({ 
        slug, 
        _id: { $ne: id } 
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "Nama sudah digunakan" },
          { status: 400 }
        );
      }
    }

    const updateData = {
      ...body,
      slug,
      updatedBy: admin._id,
    };

    const updatedImage = await RegionCityImage.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("createdBy", "name").populate("updatedBy", "name");

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error updating region/city image:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus region/city image
export async function DELETE(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const image = await RegionCityImage.findById(id);
    if (!image) {
      return NextResponse.json(
        { success: false, error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus gambar dari Cloudinary
    try {
      if (image.image?.publicId) {
        await cloudinary.uploader.destroy(image.image.publicId);
      }
    } catch (cloudinaryError) {
      console.warn("Warning: Failed to delete from Cloudinary:", cloudinaryError.message);
    }

    await RegionCityImage.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `${image.type === "region" ? "Region" : "City"} berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleting region/city image:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data" },
      { status: 500 }
    );
  }
}
