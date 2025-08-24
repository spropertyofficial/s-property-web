import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyAdmin } from "@/lib/auth";

// GET /api/admin/leads - admin-only list with filters & pagination
export async function GET(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const source = (searchParams.get("source") || "").trim();
    const agent = (searchParams.get("agent") || "").trim();
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      100
    );

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (agent) filter.agent = agent;
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { contact: regex }, { email: regex }];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Lead.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "name status property propertyName unit agent contact email source createdAt updatedAt"
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
    console.error("Admin Leads GET error", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data leads" },
      { status: 500 }
    );
  }
}
