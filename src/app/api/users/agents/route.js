import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdmin } from "@/lib/auth";
import User from "@/lib/models/User";

// GET /api/users/agents
export async function GET(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 401 });
    }
    await connectDB();
    const agents = await User.find({ type: { $in: ["agent", "semi-agent", "sales-inhouse"] }, isActive: true })
      .select("name agentCode isActive")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({ success: true, items: agents });
  } catch (error) {
    console.error("GET /api/users/agents error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data agen" }, { status: 500 });
  }
}
