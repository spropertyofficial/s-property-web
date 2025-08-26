import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyAdminWithRole } from "@/lib/auth";

// POST /api/admin/users/[id]/reset-password - superadmin only
export async function POST(req, { params }) {
  try {
    const auth = await verifyAdminWithRole(req, ["superadmin"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = params;
    const { password } = await req.json();
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(id, { password: hashed }, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/admin/users/[id]/reset-password error:", error);
    return NextResponse.json({ success: false, message: "Gagal reset password" }, { status: 500 });
  }
}
