// src/app/api/properties/all-residentials/route.js
import { getAllProperties } from "@/services/propertyService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const residentials = await getAllProperties();
    return NextResponse.json({ residentials });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data properti gabungan" },
      { status: 500 }
    );
  }
}
