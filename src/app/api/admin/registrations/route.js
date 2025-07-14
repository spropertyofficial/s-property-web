import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { verifyAdminWithRole } from "@/lib/auth";

export async function GET(request) {
  try {
    // Verify admin with read permission (all roles can read)
    const authResult = await verifyAdminWithRole(request, ["superadmin", "editor", "viewer"]);
    if (authResult.error) {
      return authResult.error;
    }

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
