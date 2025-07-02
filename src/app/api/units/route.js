import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UnitType from "@/lib/models/UnitType";
import Cluster from "@/lib/models/Cluster";
import { verifyAdmin } from "@/lib/auth";

// GET: Mengambil semua tipe unit, bisa difilter by clusterId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const clusterId = searchParams.get("clusterId");

    const filter = {};
    if (clusterId) {
      filter.cluster = clusterId;
    }

    await connectDB();
    const units = await UnitType.find(filter).populate("cluster", "name");
    return NextResponse.json({ success: true, units });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data Tipe Unit" },
      { status: 500 }
    );
  }
}

// POST: Membuat tipe unit baru
export async function POST(req) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, price, clusterId } = body;

    if (!name || !price || !clusterId) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama, harga, dan ID Cluster induk wajib diisi",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Langkah 1: Buat dokumen tipe unit baru
    const newUnitType = new UnitType({
      ...body,
      cluster: clusterId, // Set referensi ke cluster induk
    });
    await newUnitType.save();

    // Langkah 2: Tambahkan ID tipe unit baru ini ke array 'unitTypes' di dokumen Cluster induknya
    await Cluster.findByIdAndUpdate(clusterId, {
      $push: { unitTypes: newUnitType._id },
    });

    return NextResponse.json({
      success: true,
      message: "Tipe Unit berhasil ditambahkan",
      unit: newUnitType,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat membuat Tipe Unit",
      },
      { status: 500 }
    );
  }
}
