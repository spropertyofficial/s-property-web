import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";

export async function GET() {
  try {
    await dbConnect();

    const registrations = await Registration.find({})
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      registrations,
    });

  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data registrasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
