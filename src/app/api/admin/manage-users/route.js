import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { verifyToken } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = verifyToken(req);

    if (!decoded || decoded.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const admins = await Admin.find().select("-password");
    return NextResponse.json(admins);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }
}
