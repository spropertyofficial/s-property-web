import connectDB from "@/lib/mongodb";
import Property from "@/lib/models/Property"; // Gunakan model Property yang baru
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth"; // Impor helper verifikasi

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};
// GET: Mengambil satu properti berdasarkan ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const property = await Property.findById(id)
      .populate("assetType", "name")
      .populate("marketStatus", "name")
      .populate("listingStatus", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("clusters")
      .lean();

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Properti tidak ditemukan di database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, property });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data properti" },
      { status: 500 }
    );
  }
}

// PUT: Mengupdate properti berdasarkan ID
export async function PUT(req, { params }) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updateData = {
      ...body,
      updatedBy: admin._id, // Otomatis set admin yang mengupdate
    };

    await connectDB();
    const updated = await Property.findByIdAndUpdate(id, updateData, {
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

// DELETE: Menghapus properti berdasarkan ID
export async function DELETE(req, { params }) {
  try {
    // 1. Amankan endpoint
    const { success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    const { id } = params;
    await connectDB();

    // 2. PERUBAHAN: Gunakan model 'Property' dan tambahkan .populate()
    // Kita butuh `populate` untuk mendapatkan nama `assetType` untuk path folder Cloudinary
    const property = await Property.findById(id).populate("assetType", "name");

    if (!property) {
      return NextResponse.json(
        { error: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. PERUBAHAN: Buat folder path secara dinamis
    const assetTypeSlug = slugify(property.assetType.name);
    const propertySlug = slugify(property.name);
    const folderPath = `s-property/${assetTypeSlug}/${propertySlug}`;

    console.log(`Menghapus folder dari Cloudinary: ${folderPath}`);

    try {
      // Logika hapus Cloudinary Anda sudah benar
      await cloudinary.api.delete_resources_by_prefix(folderPath);
      await cloudinary.api.delete_folder(folderPath);
    } catch (cloudinaryError) {
      // Jika gagal di Cloudinary, kita hanya catat error tapi proses hapus DB tetap lanjut
      console.warn(
        `Peringatan: Gagal menghapus dari Cloudinary, proses lanjut. Error:`,
        cloudinaryError.message
      );
    }

    // 4. PERUBAHAN: Gunakan model 'Property' untuk menghapus dari DB
    await Property.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Properti dan aset terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus properti" },
      { status: 500 }
    );
  }
}
