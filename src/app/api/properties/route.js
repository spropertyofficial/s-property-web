// src/app/api/properties/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Property from "@/lib/models/Property";
import CategoryAssetType from "@/lib/models/CategoryAssetType";
import CategoryMarketStatus from "@/lib/models/CategoryMarketStatus";
import CategoryListingStatus from "@/lib/models/CategoryListingStatus";
import { verifyAdmin } from "@/lib/auth";

// Fungsi ini sekarang bisa menerima filter
export async function getPropertiesData(filter = {}) {
  await connectDB();
  const properties = await Property.find(filter) // <-- Terapkan filter di sini
    .populate("assetType", "name")
    .populate("marketStatus", "name")
    .populate("listingStatus", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .lean();
  return properties;
}

// Fungsi GET sekarang bisa membaca query parameter dari URL
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const assetTypeName = searchParams.get("assetType");

    const filter = {};

    if (assetTypeName) {
      // Cari ID dari nama Tipe Aset
      const assetTypeDoc = await CategoryAssetType.findOne({
        name: new RegExp(`^${assetTypeName}$`, "i"),
      });

      if (assetTypeDoc) {
        filter.assetType = assetTypeDoc._id;
      } else {
        // Jika tipe aset tidak ditemukan, kembalikan array kosong
        return NextResponse.json({ properties: [] });
      }
    }

    const properties = await getPropertiesData(filter);
    return NextResponse.json({ properties });
  } catch (err) {
    console.error("GET properties error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// Endpoint POST untuk membuat properti baru
export async function POST(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    console.log("Admin verification result:", success, admin);
    if (!success) {
      return NextResponse.json(
        { error: "Akses tidak diizinkan" },
        { status: 401 }
      );
    }

    const body = await req.json();
    await connectDB();

    const propertyData = {
      ...body,
      createdBy: admin._id,
      updatedBy: admin._id,
    };

    const property = new Property(propertyData);
    await property.save();

    return NextResponse.json({ success: true, id: property._id });
  } catch (err) {
    console.error("POST property error:", err);
    // Berikan pesan error yang lebih detail jika ada error validasi
    if (err.name === "ValidationError") {
      return NextResponse.json(
        { error: "Data tidak valid", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
