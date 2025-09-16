import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyAdmin } from "@/lib/auth";
import Property from "@/lib/models/Property";

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
    const sortDate = (searchParams.get("sortDate") || "desc").trim();
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (agent) filter.agent = agent;
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { contact: regex }, { email: regex }];
    }

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate + "T23:59:59.999Z") };
    }

    // Sorting
    const sortObj = { createdAt: sortDate === "asc" ? 1 : -1 };

    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    let items = [];
    if (page <= totalPages) {
      items = await Lead.find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "name status property propertyName unit agent contact email source leadInAt createdAt updatedAt"
        )
        .populate("property", "name")
        .populate("agent", "name agentCode")
        .lean();
    }
    return NextResponse.json({
      success: true,
      data: items,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Admin Leads GET error", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data leads" },
      { status: 500 }
    );
  }
}
