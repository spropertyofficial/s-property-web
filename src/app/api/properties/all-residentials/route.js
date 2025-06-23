// src/app/api/properties/all-residentials/route.js
import { getAllResidentials } from "@/services/propertyService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const residentials = await getAllResidentials();
    return NextResponse.json({ residentials });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data properti gabungan" },
      { status: 500 }
    );
  }
}
