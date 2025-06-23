//app//api/residential/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Residential from "@/lib/models/Residential";

export async function getResidentialsData() {
  await connectDB();
  const residentials = await Residential.find().lean();
  return residentials;
}

export async function GET() {
  try {
    await connectDB()
    const residentials = await Residential.find().lean()
    return NextResponse.json({ residentials })
  } catch (err) {
    console.error('GET error:', err)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    await connectDB()
    const residential = new Residential(body)
    await residential.save()
    return NextResponse.json({ success: true, id: residential._id })
  } catch (err) {
    console.error('POST error:', err)
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 })
  }
}
