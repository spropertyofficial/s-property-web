// src/app/api/properties/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Property from "@/lib/models/Property";
import CategoryAssetType from "@/lib/models/CategoryAssetType";
import CategoryMarketStatus from "@/lib/models/CategoryMarketStatus";
import CategoryListingStatus from "@/lib/models/CategoryListingStatus";
import Cluster from "@/lib/models/Cluster";
import { verifyAdmin } from "@/lib/auth";
import { logAgentActivity, ACTIVITY_TYPES } from "@/utils/activityLogger";

// Fungsi ini sekarang bisa menerima filter
export async function getPropertiesData(filter = {}) {
  try {
    await connectDB();
    
    const properties = await Property.find(filter)
      .populate("assetType", "name")
      .populate("marketStatus", "name")
      .populate("listingStatus", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .lean();
    
    // Convert to plain objects and map fields to match frontend expectations
    const serialized = JSON.parse(JSON.stringify(properties));
    
    // Transform database fields to match frontend expectations
    const transformed = serialized.map(property => ({
      ...property,
      // Map database fields to expected frontend fields
      title: property.name,
      price: property.startPrice,
      // Keep original fields for compatibility
      name: property.name,
      startPrice: property.startPrice
    }));
    
    return transformed;
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}

// Fungsi GET sekarang bisa membaca query parameter dari URL
export async function GET(req) {
  try {
    await connectDB();
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
    console.error("Error fetching properties:", err);
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
    if (!success) {
      return NextResponse.json(
        { error: "Akses tidak diizinkan" },
        { status: 401 }
      );
    }

    const body = await req.json();
    // Ambil flag baru dari frontend untuk menentukan tipe perumahan
    const { hasMultipleClusters, ...propertyData } = body;

    await connectDB();

    // Dapatkan nama dari assetType ID untuk logika kondisional
    const assetTypeDoc = await CategoryAssetType.findById(
      propertyData.assetType
    );
    const assetTypeName = assetTypeDoc ? assetTypeDoc.name : "";

    // Siapkan data properti awal
    const newPropertyPayload = {
      ...propertyData,
      createdBy: admin._id,
      updatedBy: admin._id,
      clusters: [], // Mulai dengan array cluster kosong
    };

    const property = new Property(newPropertyPayload);
    await property.save();

    // Log property creation activity
    try {
      await logAgentActivity(
        admin._id, 
        ACTIVITY_TYPES.PROPERTY_CREATED,
        `Created property: ${property.name}`,
        {
          relatedProperty: property._id,
          metadata: { propertyType: assetTypeName },
          priority: "high"
        }
      );
    } catch (error) {
      console.error("Error logging property creation activity:", error);
    }

    // Auto-create Cluster Default untuk Apartemen atau Perumahan sederhana
    if (
      assetTypeName === "Apartemen" || 
      (assetTypeName === "Perumahan" && hasMultipleClusters === false)
    ) {
      console.log(`Membuat cluster default untuk ${assetTypeName}: ${property.name}`);
      const defaultCluster = new Cluster({
        name: `Cluster Default`, // Nama cluster default yang tersembunyi
        description: `Cluster default untuk ${assetTypeName.toLowerCase()} ${property.name}`,
        property: property._id, // Hubungkan ke properti yang baru dibuat
      });
      await defaultCluster.save();

      // Update kembali properti untuk menambahkan ID cluster default ini
      property.clusters.push(defaultCluster._id);
      await property.save();
    }

    return NextResponse.json({
      success: true,
      id: property._id,
      message: "Properti berhasil dibuat",
    });
  } catch (err) {
    console.error("POST property error:", err);
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
