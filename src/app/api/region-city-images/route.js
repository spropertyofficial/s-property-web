import connectDB from "@/lib/mongodb";
import RegionCityImage from "@/lib/models/RegionCityImage";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";

// GET: Ambil semua region dan city images
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "region" atau "city"
    const parentRegion = searchParams.get("parentRegion");
    const isActive = searchParams.get("isActive");

    let query = {};
    
    if (type) query.type = type;
    if (parentRegion) query.parentRegion = parentRegion;
    if (isActive !== null) query.isActive = isActive === "true";

    const images = await RegionCityImage.find(query)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ type: 1, priority: -1, name: 1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      images,
      total: images.length 
    });
  } catch (error) {
    console.error("Error fetching region/city images:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data gambar" },
      { status: 500 }
    );
  }
}

// POST: Tambah region atau city image baru
export async function POST(req) {
  try {
    const { success, admin } = await verifyAdmin(req);
    if (!success) {
      return NextResponse.json({ message: "Akses Ditolak" }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const { name, type, parentRegion, image, priority = 0, isActive = true } = body;

    // Validasi input
    if (!name || !type || !image) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (type === "city" && !parentRegion) {
      return NextResponse.json(
        { success: false, error: "Parent region harus diisi untuk city" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

    // Cek apakah slug sudah ada
    const existingSlug = await RegionCityImage.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Nama sudah digunakan" },
        { status: 400 }
      );
    }

    const newImage = new RegionCityImage({
      name,
      type,
      parentRegion: type === "city" ? parentRegion : undefined,
      slug,
      image,
      priority,
      isActive,
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    await newImage.save();

    const populatedImage = await RegionCityImage.findById(newImage._id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    return NextResponse.json({
      success: true,
      message: `${type === "region" ? "Region" : "City"} berhasil ditambahkan`,
      image: populatedImage,
    });
  } catch (error) {
    console.error("Error creating region/city image:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan data" },
      { status: 500 }
    );
  }
}
