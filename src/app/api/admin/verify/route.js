import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req) {
  try {
    const token = req.cookies.get("auth-token");

    console.log("Verify API - Token found:", token ? "YES" : "NO"); // Debug log

    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token.value, JWT_SECRET);
    console.log("Verify API - Token valid for user:", decoded.userId); // Debug log

    return NextResponse.json({
      valid: true,
      user: {
        userId: decoded.userId,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Token verification failed:", error.message); // Debug log
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
