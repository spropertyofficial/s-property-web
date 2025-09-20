import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/lib/models/Admin";
import connectDB from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req) {

  try {
    await connectDB();
    const { email, password } = await req.json();

    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: admin._id, type: "admin", role: admin.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Login successful, setting cookie..."); // Debug log

    const res = NextResponse.json({
      message: "Login success",
      success: true,
    });

    // Set cookie dengan nama 'auth-token' agar konsisten dengan user
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax", // Penting untuk cross-site requests
    });

    console.log("Cookie set with token:", token.substring(0, 20) + "..."); // Debug log

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
