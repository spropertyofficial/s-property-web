import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UnitType from "@/lib/models/UnitType";
import Cluster from "@/lib/models/Cluster";
import { verifyAdmin } from "@/lib/auth";

// GET: Mengambil detail satu tipe unit
export async function GET(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success)
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );

    await connectDB();
    const unit = await UnitType.findById(params.id).populate("cluster", "name");

    if (!unit)
      return NextResponse.json(
        { success: false, error: "Tipe Unit tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, unit });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// PUT: Mengupdate satu tipe unit
export async function PUT(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success)
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );

    const { id } = params;
    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: "Nama dan harga tidak boleh kosong" },
        { status: 400 }
      );
    }

    await connectDB();
    const updatedUnit = await UnitType.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedUnit)
      return NextResponse.json(
        { success: false, error: "Tipe Unit tidak ditemukan" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Tipe Unit berhasil diperbarui",
      unit: updatedUnit,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus satu tipe unit
export async function DELETE(req, { params }) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success)
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );

    const { id: unitId } = params;
    if (!unitId)
      return NextResponse.json(
        { success: false, error: "ID Tipe Unit diperlukan" },
        { status: 400 }
      );

    await connectDB();

    const unitToDelete = await UnitType.findById(unitId);
    if (!unitToDelete)
      return NextResponse.json(
        { success: false, error: "Tipe Unit tidak ditemukan" },
        { status: 404 }
      );

    // Hapus referensi tipe unit ini dari dokumen Cluster induknya
    await Cluster.findByIdAndUpdate(unitToDelete.cluster, {
      $pull: { unitTypes: unitId },
    });

    // Hapus dokumen tipe unit itu sendiri
    await UnitType.findByIdAndDelete(unitId);

    return NextResponse.json({
      success: true,
      message: `Tipe Unit "${unitToDelete.name}" berhasil dihapus.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
