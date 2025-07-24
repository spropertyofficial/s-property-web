import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import User from "@/lib/models/User";
import { verifyAdminWithRole } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { generateRandomPassword } from "@/lib/utils/password";

export async function GET(request, { params }) {
  try {
    // Verify admin with read permission
    const authResult = await verifyAdminWithRole(request, ["superadmin", "editor", "viewer"]);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();
    const { id } = await params;
    const registration = await Registration.findById(id)
      .populate("userAccount")
      .select("-__v +generatedPassword")
      .lean();

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
      generatedPassword: registration.generatedPassword || null,
      user: registration.userAccount || null,
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

    // Always select generatedPassword and userAccount for logic
    const registration = await Registration.findById(id).select("+generatedPassword userAccount personalData status");
    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message: "Registrasi tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // If approving and not yet linked to user, create user and store password
    let userCreated = null;
    let generatedPassword = registration.generatedPassword;
    if (
      status === "approved" &&
      !registration.userAccount &&
      !registration.generatedPassword
    ) {
      // Generate password
      generatedPassword = generateRandomPassword(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      // Determine user type mapping
      let userType = "user";
      if (["agent", "semi-agent", "sales-inhouse"].includes(registration.personalData.category)) {
        userType = registration.personalData.category;
      }

      // Create user
      const user = await User.create({
        email: registration.personalData.email,
        password: hashedPassword,
        name: registration.personalData.fullName,
        phone: registration.personalData.phone,
        type: userType,
        isActive: true,
        forcePasswordChange: true, // user wajib ganti password saat login pertama
      });
      registration.userAccount = user._id;
      registration.generatedPassword = generatedPassword;
      userCreated = user;
    }

    // Update registration status and review info
    await registration.updateStatus(status, reviewNotes, authResult.admin._id);
    // Save userAccount and generatedPassword if set
    if (userCreated) {
      await registration.save();
    }

    // Kirim email notifikasi ke user jika status approved atau rejected
    try {
      if (["approved", "rejected"].includes(status)) {
        let subject = status === "approved" ? "Pendaftaran Anda Disetujui" : "Pendaftaran Anda Ditolak";
        let heading = status === "approved" ? "Selamat, Pendaftaran Anda Disetujui!" : "Mohon Maaf, Pendaftaran Anda Ditolak";
        let message = status === "approved"
          ? `<p style='font-size:16px;color:#222;margin-bottom:16px;'>Akun Anda telah disetujui oleh admin S-Property. Silakan login menggunakan email dan password yang dikirimkan (jika ada).</p>`
          : `<p style='font-size:16px;color:#222;margin-bottom:16px;'>Pendaftaran Anda tidak dapat kami proses. Silakan cek catatan berikut dan lakukan pendaftaran ulang jika diperlukan.</p>`;
        let notes = reviewNotes ? `<div style='background:#f6f8fa;border-radius:8px;padding:16px;margin-bottom:16px;'><b>Catatan Admin:</b><br>${reviewNotes}</div>` : "";
        let passwordInfo = "";
        if (status === "approved" && generatedPassword) {
          passwordInfo = `<div style='background:#e0f7fa;border-radius:8px;padding:16px;margin-bottom:16px;'><b>Password Sementara:</b> <span style='font-family:monospace;'>${generatedPassword}</span><br><span style='font-size:13px;color:#666;'>Silakan login dan segera ganti password Anda.</span></div>`;
        }
        await sendMail({
          to: registration.personalData.email,
          subject: subject + " - S-Property",
          html: `
            <div style='font-family:Segoe UI,Arial,sans-serif;background:#f6f8fa;padding:32px;'>
              <div style='max-width:480px;margin:auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.07);padding:32px;'>
                <div style='text-align:center;margin-bottom:24px;'>
                  <img src='https://res.cloudinary.com/s-property-cms/image/upload/v1753347712/logo_xqhge3.png' alt='S-Property Logo' width='120' />
                  <h2 style='color:#0e7490;font-size:22px;font-weight:bold;margin-top:8px;margin-bottom:8px;'>${heading}</h2>
                </div>
                ${message}
                ${notes}
                ${passwordInfo}
                <hr style='margin:32px 0;border:none;border-top:1px solid #eee;' />
                <div style='text-align:center;font-size:13px;color:#aaa;'>&copy; ${new Date().getFullYear()} S-Property. All rights reserved.</div>
              </div>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Gagal mengirim email notifikasi status registrasi:", err);
    }

    // Always return registration with userAccount and generatedPassword (if admin)
    const updatedRegistration = await Registration.findById(id)
      .populate("userAccount")
      .select("-__v +generatedPassword");

    return NextResponse.json({
      success: true,
      message: "Status registrasi berhasil diperbarui",
      registration: updatedRegistration,
      generatedPassword: updatedRegistration.generatedPassword || null,
      user: updatedRegistration.userAccount || null,
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
