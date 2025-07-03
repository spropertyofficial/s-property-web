import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cluster from "@/lib/models/Cluster";
import Property from "@/lib/models/Property";
import { verifyAdmin } from "@/lib/auth";

// GET: Mengambil semua cluster, bisa difilter by propertyId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const filter = {};
    if (propertyId) {
      filter.property = propertyId;
    }

    await connectDB();
    const clusters = await Cluster.find(filter).populate("property", "name");
    return NextResponse.json({ success: true, clusters });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data cluster" },
      { status: 500 }
    );
  }
}

// POST: Membuat cluster baru
export async function POST(req) {
  try {
    const { success } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { name, description, gallery, propertyId } = await req.json();

    if (!name || !propertyId) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama cluster dan ID Properti induk wajib diisi",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newCluster = new Cluster({
      name,
      description,
      gallery, // <-- Simpan gallery
      property: propertyId,
    });
    await newCluster.save();

    await Property.findByIdAndUpdate(propertyId, {
      $push: { clusters: newCluster._id },
    });

    return NextResponse.json({
      success: true,
      message: "Cluster berhasil ditambahkan",
      cluster: newCluster,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
