//app//api/residential/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Residential from "@/lib/models/Residential";
import { verifyToken } from "@/lib/auth";

export async function getResidentialsData() {
  await connectDB();
  const residentials = await Residential.find()
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .lean();
  return residentials;
}

export async function GET() {
  try {
    const residentials = await getResidentialsData();
    return NextResponse.json({ residentials });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const adminAuth = await verifyToken(req);
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Akses tidak diizinkan" },
        { status: 401 }
      );
    }

    const body = await req.json();
    await connectDB();
    const residentialData = {
      ...body,
      createdBy: adminAuth.id,
      updatedBy: adminAuth.id,
    };
    const residential = new Residential(residentialData);
    await residential.save();
    return NextResponse.json({ success: true, id: residential._id });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
