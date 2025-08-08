import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    // Create an admin if none exists
    const adminData = {
      email: "admin@sproperty.co.id",
      password: await bcrypt.hash("sproperty2024", 12),
      role: "admin",
      name: "Super Admin",
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin already exists",
        email: adminData.email
      });
    }

    const admin = await Admin.create(adminData);
    
    return NextResponse.json({
      success: true,
      message: "Admin created successfully",
      email: admin.email
    });

  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin", details: error.message },
      { status: 500 }
    );
  }
}