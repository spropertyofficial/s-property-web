import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        type: user.type,
        agentCode: user.agentCode,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response, tapi pastikan forcePasswordChange tetap ada
    const { password: _, ...userWithoutPassword } = user.toObject();
    // Pastikan forcePasswordChange tetap ada di userWithoutPassword
    if (typeof user.forcePasswordChange !== "undefined") {
      userWithoutPassword.forcePasswordChange = user.forcePasswordChange;
    }

    const response = NextResponse.json({
      message: user.forcePasswordChange ? "Password change required" : "Login successful",
      user: userWithoutPassword,
      token,
      requirePasswordChange: !!user.forcePasswordChange,
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
