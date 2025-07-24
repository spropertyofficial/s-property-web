import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendMail } from "@/lib/email/sendMail";
import crypto from "crypto";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json(
      { success: false, message: "Email wajib diisi" },
      { status: 400 }
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Email tidak ditemukan" },
      { status: 404 }
    );
  }
  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 menit
  try {
    await user.save();
  } catch (err) {
    console.error("Gagal menyimpan token reset password:", err);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan token reset password." },
      { status: 500 }
    );
  }
  // Kirim email
  const resetUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4004"
  }/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset Password S-Property",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.07); padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='https://res.cloudinary.com/s-property-cms/image/upload/v1753347712/logo_xqhge3.png' alt='S-Property Logo' width='200' />
            <h2 style="color: #0e7490; font-size: 24px; font-weight: bold; margin-top: 8px; margin-bottom: 8px;">Reset Password S-Property</h2>
          </div>
          <p style="font-size: 16px; color: #222; margin-bottom: 16px;">Halo,</p>
          <p style="font-size: 16px; color: #222; margin-bottom: 24px;">Kami menerima permintaan untuk reset password akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan proses reset password:</p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href='${resetUrl}' style="display: inline-block; background: #0e7490; color: #fff; font-weight: bold; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 2px 8px rgba(14,116,144,0.12);">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Link berlaku selama <b>30 menit</b>. Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; font-size: 13px; color: #aaa;">&copy; ${new Date().getFullYear()} S-Property. All rights reserved.</div>
        </div>
      </div>
    `,
  });
  return NextResponse.json({
    success: true,
    message: "Instruksi reset password sudah dikirim ke email Anda.",
  });
}
