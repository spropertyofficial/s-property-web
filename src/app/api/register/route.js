import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/lib/models/Registration";
import User from "@/lib/models/User";
import { sendMail } from "@/lib/email/sendMail";

export async function POST(request) {
  try {
    await dbConnect();

    const data = await request.json();
    
    // Extract client info
    const clientIp = request.headers.get("x-forwarded-for") || 
                    request.headers.get("x-real-ip") || 
                    request.ip || 
                    "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Validate required fields
    const requiredFields = [
      "personalData.fullName",
      "personalData.category",
      "personalData.birthPlace", 
      "personalData.birthDate",
      "personalData.phone",
      "personalData.email",
      "documents.city",
      "documents.nik",
      "documents.npwp",
      "documents.ktpFile",
      "documents.npwpFile",
      "bankAccount.accountNumber",
      "bankAccount.bankName",
      "bankAccount.accountHolder",
      "bankAccount.bankBookFile"
    ];

    for (const field of requiredFields) {
      const fieldValue = getNestedValue(data, field);
      if (!fieldValue) {
        return NextResponse.json(
          {
            success: false,
            message: `Field ${field} is required`,
            field: field,
          },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email
    const existingEmailRegistration = await Registration.findOne({
      "personalData.email": data.personalData.email,
    });
    
    if (existingEmailRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar. Silakan gunakan email lain.",
          field: "personalData.email",
        },
        { status: 400 }
      );
    }

    // Check for duplicate phone
    const existingPhoneRegistration = await Registration.findOne({
      "personalData.phone": data.personalData.phone,
    });
    
    if (existingPhoneRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: "Nomor telepon sudah terdaftar. Silakan gunakan nomor lain.",
          field: "personalData.phone",
        },
        { status: 400 }
      );
    }

    // Check for duplicate email in User collection
    const existingUser = await User.findOne({ email: data.personalData.email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah terdaftar sebagai user. Silakan gunakan email lain.",
          field: "personalData.email",
        },
        { status: 400 }
      );
    }

    // Check for duplicate NIK
    const existingNikRegistration = await Registration.findOne({
      "documents.nik": data.documents.nik,
    });
    if (existingNikRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK sudah terdaftar. Silakan periksa kembali.",
          field: "documents.nik",
        },
        { status: 400 }
      );
    }

    // Create new registration
    const registrationData = {
      personalData: {
        fullName: data.personalData.fullName.trim(),
        category: data.personalData.category,
        birthPlace: data.personalData.birthPlace.trim(),
        birthDate: new Date(data.personalData.birthDate),
        phone: data.personalData.phone.trim(),
        email: data.personalData.email.toLowerCase().trim(),
        referralPhone: data.personalData.referralPhone?.trim() || null,
      },
      documents: {
        city: data.documents.city.trim(),
        nik: data.documents.nik.trim(),
        npwp: data.documents.npwp.trim(),
        ktpFile: {
          url: data.documents.ktpFile.url,
          publicId: data.documents.ktpFile.publicId,
          uploadedAt: new Date(),
        },
        npwpFile: {
          url: data.documents.npwpFile.url,
          publicId: data.documents.npwpFile.publicId,
          uploadedAt: new Date(),
        },
      },
      bankAccount: {
        accountNumber: data.bankAccount.accountNumber.trim(),
        bankName: data.bankAccount.bankName.trim(),
        accountHolder: data.bankAccount.accountHolder.trim(),
        bankBookFile: {
          url: data.bankAccount.bankBookFile.url,
          publicId: data.bankAccount.bankBookFile.publicId,
          uploadedAt: new Date(),
        },
      },
      status: "pending",
      submittedAt: new Date(),
      ipAddress: clientIp,
      userAgent: userAgent,
    };

    const registration = new Registration(registrationData);
    await registration.save();

    // Kirim email sambutan ke user
    try {
      await sendMail({
        to: registration.personalData.email,
        subject: "Pendaftaran S-Property Berhasil",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src='https://res.cloudinary.com/s-property-cms/image/upload/v1753347712/logo_xqhge3.png' alt='S-Property Logo' width='200' />
                <h2 style="color: #0e7490; font-size: 24px; font-weight: bold; margin-top: 8px; margin-bottom: 8px;">Selamat Datang di S-Property!</h2>
              </div>
              <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Halo ${registration.personalData.fullName},</p>
              <p style="font-size: 16px; color: #222; margin-bottom: 24px;">Terima kasih telah mendaftar di S-Property. Pendaftaran Anda telah kami terima dan sedang menunggu persetujuan dari admin.</p>
              <p style="font-size: 15px; color: #666;">Kami akan mengirimkan email notifikasi setelah pendaftaran Anda disetujui atau ditolak oleh admin. Mohon tunggu proses verifikasi maksimal 1x24 jam.</p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
              <div style="text-align: center; font-size: 13px; color: #aaa;">&copy; ${new Date().getFullYear()} S-Property. All rights reserved.</div>
            </div>
          </div>
        `,
      });
      // Kirim email notifikasi ke admin
      await sendMail({
        to: process.env.EMAIL_USER,
        subject: "Pendaftar Baru S-Property",
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
            <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src='https://res.cloudinary.com/s-property-cms/image/upload/v1753347712/logo_xqhge3.png' alt='S-Property Logo' width='120' />
                <h2 style="color: #0e7490; font-size: 22px; font-weight: bold; margin-top: 8px; margin-bottom: 8px;">Pendaftar Baru S-Property</h2>
              </div>
              <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Ada pendaftar baru di S-Property:</p>
              <ul style="font-size: 15px; color: #222; margin-bottom: 24px;">
                <li><b>Nama:</b> ${registration.personalData.fullName}</li>
                <li><b>Email:</b> ${registration.personalData.email}</li>
                <li><b>Telepon:</b> ${registration.personalData.phone}</li>
                <li><b>Kategori:</b> ${registration.personalData.category}</li>
                <li><b>Kota:</b> ${registration.documents.city}</li>
                <li><b>NIK:</b> ${registration.documents.nik}</li>
                <li><b>NPWP:</b> ${registration.documents.npwp}</li>
              </ul>
              <p style="font-size: 15px; color: #666;">Segera review pendaftaran ini di halaman admin.</p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4004'}/admin/registrations/${registration._id}" style="display: inline-block; background: #0e7490; color: #fff; font-weight: bold; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 15px;">Review Pendaftaran</a>
              </div>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
              <div style="text-align: center; font-size: 13px; color: #aaa;">&copy; ${new Date().getFullYear()} S-Property. All rights reserved.</div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Gagal mengirim email sambutan registrasi atau notifikasi admin:", err);
    }

    // Send success response
    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil dikirim. Tim kami akan segera menghubungi Anda.",
      data: {
        registrationId: registration._id,
        status: registration.status,
        submittedAt: registration.submittedAt,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
      }));
      
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let message = "Data sudah terdaftar";
      
      if (duplicateField.includes("email")) {
        message = "Email sudah terdaftar";
      } else if (duplicateField.includes("phone")) {
        message = "Nomor telepon sudah terdaftar";
      } else if (duplicateField.includes("nik")) {
        message = "NIK sudah terdaftar";
      }
      
      return NextResponse.json(
        {
          success: false,
          message: message,
          field: duplicateField,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses registrasi",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}
