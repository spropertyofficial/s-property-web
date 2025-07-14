import connectDB from "@/lib/mongodb";
import Property from "@/lib/models/Property";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    
    // Ambil semua properti residential
    const properties = await Property.find({
      assetType: { $exists: true }
    })
    .populate("assetType", "name")
    .select("location assetType")
    .lean();

    // Filter hanya perumahan
    const residentials = properties.filter(
      property => property.assetType?.name?.toLowerCase() === "perumahan"
    );

    // Extract unique regions dan cities
    const regions = [...new Set(
      residentials
        .map(p => p.location?.region)
        .filter(Boolean)
    )].sort();
    
    const cities = [...new Set(
      residentials
        .map(p => p.location?.city)
        .filter(Boolean)
    )].sort();

    return NextResponse.json({ 
      success: true, 
      regions,
      cities,
      stats: {
        totalProperties: residentials.length,
        totalRegions: regions.length,
        totalCities: cities.length
      }
    });
  } catch (error) {
    console.error("Error fetching available locations:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data lokasi" },
      { status: 500 }
    );
  }
}
