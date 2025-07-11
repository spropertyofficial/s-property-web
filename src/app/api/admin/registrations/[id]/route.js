import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import { verifyAdminWithRole } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    // Verify admin with read permission
    const authResult = await verifyAdminWithRole(request, ["superadmin", "editor", "viewer"]);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();
    
    const { id } = await params;
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
    // Verify admin with write permission (only superadmin and editor)
    const authResult = await verifyAdminWithRole(request, ["superadmin", "editor"]);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const { id } = await params;
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
    await registration.updateStatus(status, reviewNotes, authResult.admin._id);

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

export async function DELETE(request, { params }) {
  try {
    // Verify admin with delete permission (only superadmin)
    const authResult = await verifyAdminWithRole(request, ["superadmin"]);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const { id } = await params;
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

    // TODO: Optionally delete files from Cloudinary
    // const filesToDelete = [
    //   registration.documents.ktp?.publicId,
    //   registration.documents.npwp?.publicId,
    //   registration.documents.bankBook?.publicId
    // ].filter(Boolean);
    
    // if (filesToDelete.length > 0) {
    //   await cloudinary.api.delete_resources(filesToDelete);
    // }

    await Registration.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil dihapus",
    });

  } catch (error) {
    console.error("Error deleting registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus registrasi",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
