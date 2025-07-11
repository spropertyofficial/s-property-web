import connectDB from "@/lib/mongodb";
import Property from "@/lib/models/Property";
import RegionCityImage from "@/lib/models/RegionCityImage";
import CategoryAssetType from "@/lib/models/CategoryAssetType";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // Ambil semua properti residential
    const properties = await Property.find({
      assetType: { $exists: true },
    })
      .populate("assetType", "name")
      .select("location assetType")
      .lean();

    // Filter hanya perumahan
    const residentials = properties.filter(
      (property) => property.assetType?.name?.toLowerCase() === "perumahan"
    );

    // Ambil data gambar dari CMS
    const images = await RegionCityImage.find({
      isActive: true,
    })
      .select("name type slug image")
      .lean();

    // Buat mapping untuk gambar berdasarkan nama
    const imageMap = {};
    images.forEach((img) => {
      const key = `${img.type}-${img.name}`;
      imageMap[key] = img.image.src;
    });

    // Process data hierarkis dari properti
    const data = {};

    residentials.forEach((property) => {
      const region = property.location?.region;
      const city = property.location?.city;

      if (region && city) {
        // Initialize region if it doesn't exist
        if (!data[region]) {
          const regionKey = `region-${region}`;
          data[region] = {
            name: region,
            propertyCount: 0,
            // Cek apakah ada gambar di CMS, jika tidak gunakan fallback
            imageUrl:
              imageMap[regionKey] ||
              `/images/Regions/${region
                .toLowerCase()
                .replace(/\s+/g, "-")}.webp`,
            cities: {},
          };
        }

        // Initialize city if it doesn't exist
        if (!data[region].cities[city]) {
          const cityKey = `city-${city}`;
          data[region].cities[city] = {
            name: city,
            propertyCount: 0,
            // Cek apakah ada gambar di CMS, jika tidak gunakan fallback
            imageUrl:
              imageMap[cityKey] ||
              `/images/Cities/${city.toLowerCase().replace(/\s+/g, "-")}.webp`,
          };
        }

        // Increment counters
        data[region].propertyCount += 1;
        data[region].cities[city].propertyCount += 1;
      }
    });

    // Ambil list region dan city yang ada di properti untuk info CMS
    const availableRegions = [
      ...new Set(residentials.map((p) => p.location?.region).filter(Boolean)),
    ];

    const availableCities = [
      ...new Set(residentials.map((p) => p.location?.city).filter(Boolean)),
    ];

    return NextResponse.json({
      success: true,
      data,
      meta: {
        totalRegions: Object.keys(data).length,
        totalCities: Object.values(data).reduce(
          (acc, region) => acc + Object.keys(region.cities).length,
          0
        ),
        totalProperties: residentials.length,
        availableRegions,
        availableCities,
        cmsImages: {
          total: images.length,
          regions: images.filter((img) => img.type === "region").length,
          cities: images.filter((img) => img.type === "city").length,
        },
      },
    });
  } catch (error) {
    console.error("Error in explore-cities API:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data explore cities" },
      { status: 500 }
    );
  }
}
