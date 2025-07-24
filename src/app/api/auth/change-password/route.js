import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req) {
  try {
    await connectDB();
    const { oldPassword, newPassword } = await req.json();
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    // If forcePasswordChange, oldPassword is optional, otherwise required
    if (!user.forcePasswordChange) {
      if (!oldPassword) {
        return NextResponse.json({ message: "Old password required" }, { status: 400 });
      }
      const isOldValid = await bcrypt.compare(oldPassword, user.password);
      if (!isOldValid) {
        return NextResponse.json({ message: "Old password incorrect" }, { status: 400 });
      }
    }
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.forcePasswordChange = false;
    await user.save();
    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
