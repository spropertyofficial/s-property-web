import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cluster from "@/lib/models/Cluster";
import Property from "@/lib/models/Property";
import UnitType from "@/lib/models/UnitType";
import { verifyAdmin } from "@/lib/auth";

/**
 * GET: Mengambil detail satu cluster spesifik berdasarkan ID.
 * Berguna untuk mengisi data di form edit.
 */
export async function GET(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    await connectDB();
    const cluster = await Cluster.findById(params.id)
      .populate("property", "name") // Ambil nama perumahan induknya
      .populate("unitTypes"); // Ambil semua data tipe unit di dalamnya

    if (!cluster) {
      return NextResponse.json(
        { success: false, error: "Cluster tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, cluster });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data cluster" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Mengupdate data satu cluster spesifik.
 */
export async function PUT(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success)
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );

    const { id } = params;
    const { name, description, gallery } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Nama cluster tidak boleh kosong" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedCluster = await Cluster.findByIdAndUpdate(
      id,
      { name, description, gallery }, // <-- Perbarui gallery
      { new: true }
    );

    if (!updatedCluster)
      return NextResponse.json(
        { success: false, error: "Cluster tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Cluster berhasil diperbarui",
      cluster: updatedCluster,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Menghapus satu cluster spesifik dan semua data terkait.
 */
export async function DELETE(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { id: clusterId } = params;
    if (!clusterId) {
      return NextResponse.json(
        { success: false, error: "Cluster ID diperlukan" },
        { status: 400 }
      );
    }

    await connectDB();

    const clusterToDelete = await Cluster.findById(clusterId);
    if (!clusterToDelete) {
      return NextResponse.json(
        { success: false, error: "Cluster tidak ditemukan" },
        { status: 404 }
      );
    }

    // Langkah 1: Hapus referensi cluster ini dari dokumen Property induknya
    await Property.findByIdAndUpdate(clusterToDelete.property, {
      $pull: { clusters: clusterId },
    });

    // Langkah 2: Hapus semua UnitType yang ada di dalam cluster ini (cascading delete)
    await UnitType.deleteMany({ cluster: clusterId });

    // Langkah 3 (Opsional): Hapus folder & gambar cluster dari Cloudinary jika ada
    // ... logika hapus Cloudinary di sini ...

    // Langkah 4: Hapus dokumen cluster itu sendiri
    await Cluster.findByIdAndDelete(clusterId);

    return NextResponse.json({
      success: true,
      message: `Cluster "${clusterToDelete.name}" dan semua unit di dalamnya berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE Cluster Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat menghapus cluster",
      },
      { status: 500 }
    );
  }
}
