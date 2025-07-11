import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";

export async function GET() {
  try {
    await dbConnect();

    const stats = await Registration.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error("Error fetching registration stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat statistik registrasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
