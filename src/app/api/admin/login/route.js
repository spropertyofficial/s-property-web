import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const res = NextResponse.json({ message: "Login success" });
  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}
