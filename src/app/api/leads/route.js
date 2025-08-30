import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyUser, verifyAdmin } from "@/lib/auth";
import Property from "@/lib/models/Property";

// GET /api/leads - list with filters & pagination
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const source = (searchParams.get("source") || "").trim();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100
    );
  // date filters removed

    // Auth: only authenticated user can access and only see own leads
    const userAuth = await verifyUser(req);
    if (!userAuth.success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    // enforce own leads only
    filter.agent = userAuth.user._id;
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { contact: regex }, { email: regex }];
    }

  // date filters removed

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Lead.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name status property propertyName unit agent contact email source leadInAt createdAt updatedAt"
        )
        .populate("property", "name")
  .populate("agent", "name agentCode")
        .lean(),
      Lead.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("Leads GET error", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data leads" },
      { status: 500 }
    );
  }
}

// POST /api/leads - create new lead (agent only)
export async function POST(req) {
  try {
    const userAuth = await verifyUser(req);
    if (!userAuth.success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }
    await dbConnect();

  const body = await req.json();
  const { name, contact, email, property, propertyName, unit, source, leadInAt } =
      body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama lead wajib diisi" },
        { status: 400 }
      );
    }

    // Parse leadInAt if provided (YYYY-MM-DD), fall back to now
    let leadInAtDate = undefined;
    if (leadInAt) {
      const parsed = new Date(leadInAt);
      if (!isNaN(parsed.getTime())) {
        leadInAtDate = parsed;
      }
    }

    const doc = new Lead({
      leadInAt: leadInAtDate || Date.now(),
      name: name.trim(),
      contact: contact?.trim() || undefined,
      email: email?.trim() || undefined,
      property: property || undefined,
      propertyName: propertyName?.trim() || undefined,
      unit: unit?.trim() || undefined,
      source: source?.trim() || undefined,
      agent: userAuth.user._id,
      status: "Baru",
    });

    await doc.save();

    return NextResponse.json({
      success: true,
      data: doc,
      message: "Lead berhasil dibuat",
    });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      // Specific, friendlier messages
      const message = field === "contact"
        ? "Kontak sudah ada"
        : field === "email"
        ? "Email sudah ada"
        : `${field} sudah terpakai`;
      return NextResponse.json(
        {
          success: false,
          error: message,
        },
        { status: 409 }
      );
    }
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      return NextResponse.json(
        {
          success: false,
          error: error.errors[firstKey]?.message || "Data tidak valid",
        },
        { status: 400 }
      );
    }
    console.error("Leads POST error", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat lead" },
      { status: 500 }
    );
  }
}
