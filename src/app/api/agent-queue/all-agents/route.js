import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
  await dbConnect();
  // Ambil semua user aktif (semua tipe)
  const users = await User.find({ isActive: true });
  return NextResponse.json({ agents: users });
}
