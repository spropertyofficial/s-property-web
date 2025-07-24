import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const { token, newPassword } = await req.json();
    console.log("Token diterima:", token);
  if (!token || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ success: false, message: "Token dan password baru wajib diisi (min 6 karakter)" }, { status: 400 });
  }
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    console.log("User ditemukan:", user);
  if (!user) {
    return NextResponse.json({ success: false, message: "Token tidak valid atau sudah expired" }, { status: 400 });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.forcePasswordChange = false;
  await user.save();
  return NextResponse.json({ success: true, message: "Password berhasil direset. Silakan login dengan password baru." });
}
