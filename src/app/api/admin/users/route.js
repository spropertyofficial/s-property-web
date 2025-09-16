import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyAdminWithRole } from "@/lib/auth";

// GET /api/admin/users - list users (admin roles can read)
// Query: q, type, isActive, page=1, perPage=20
export async function GET(req) {
  try {
    const auth = await verifyAdminWithRole(req, ["superadmin", "editor", "viewer"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type");
    const isActiveParam = searchParams.get("isActive");
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const perPage = Math.min(Math.max(parseInt(searchParams.get("perPage") || "20", 10), 1), 100);

    const filter = {};
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { agentCode: regex },
      ];
    }
    if (type && ["agent", "user", "semi-agent", "sales-inhouse"].includes(type)) {
      filter.type = type;
    }
    if (isActiveParam === "true" || isActiveParam === "false") {
      filter.isActive = isActiveParam === "true";
    }

    const total = await User.countDocuments(filter);
    const items = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .select("-password")
      .populate('allowedProperties','name')
      .lean();

    return NextResponse.json({ success: true, items, total, page, perPage });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat users" }, { status: 500 });
  }
}

// POST /api/admin/users - create user (superadmin, editor)
export async function POST(req) {
  try {
    const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { name, email, phone, password, type = "user", isActive = true } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: "Nama, email, phone, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    try {
      const user = await User.create({ name, email, phone, password: hashed, type, isActive });
      const plain = user.toObject();
      delete plain.password;
      return NextResponse.json({ success: true, item: plain });
    } catch (e) {
      if (e?.code === 11000) {
        return NextResponse.json(
          { success: false, message: "Email/AgentCode sudah terdaftar" },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ success: false, message: "Gagal membuat user" }, { status: 500 });
  }
}
