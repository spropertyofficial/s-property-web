import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { verifyJWT } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const registration = await Registration.findById(id).lean();

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message: "Registrasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
    });

  } catch (error) {
    console.error("Error fetching registration:", error);
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

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // Verify admin authentication
    const token = request.cookies.get("adminToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status, reviewNotes } = await request.json();

    // Validate status
    const validStatuses = ["pending", "reviewed", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status tidak valid",
        },
        { status: 400 }
      );
    }

    const registration = await Registration.findById(id);
    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message: "Registrasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Update registration status
    await registration.updateStatus(status, reviewNotes, decoded.adminId);

    return NextResponse.json({
      success: true,
      message: "Status registrasi berhasil diperbarui",
      registration: registration.toObject(),
    });

  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui status registrasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
