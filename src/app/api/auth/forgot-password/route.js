import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendMail } from "@/lib/email/sendMail";
import crypto from "crypto";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ success: false, message: "Email wajib diisi" }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ success: false, message: "Email tidak ditemukan" }, { status: 404 });
  }
  // Generate token
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 menit
  try {
    await user.save();
  } catch (err) {
    console.error("Gagal menyimpan token reset password:", err);
    return NextResponse.json({ success: false, message: "Gagal menyimpan token reset password." }, { status: 500 });
  }
  // Kirim email
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4004"}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset Password S-Property",
    html: `<p>Halo,</p><p>Klik link berikut untuk reset password akun Anda:</p><p><a href='${resetUrl}'>Reset Password</a></p><p>Link berlaku 30 menit.</p>`
  });
  return NextResponse.json({ success: true, message: "Instruksi reset password sudah dikirim ke email Anda." });
}
