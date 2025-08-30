import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import { verifyAdmin } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET(req) {
  try {
    const adminAuth = await verifyAdmin(req);
    if (!adminAuth.success) return NextResponse.json({ success:false, error:"Akses ditolak" }, { status:401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const agent = (searchParams.get("agent") || "").trim();
  const source = (searchParams.get("source") || "").trim();
  // date filters removed

    const filter = {};
    if (status) filter.status = status;
  if (agent) filter.agent = agent;
  if (source) filter.source = source;
  // date filters removed
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { contact: regex }, { email: regex }];
    }

    const rows = await Lead.find(filter)
      .sort({ updatedAt: -1 })
  .select("name contact email status property propertyName unit agent source leadInAt updatedAt createdAt")
      .populate("property", "name")
      .populate("agent", "name agentCode email")
      .lean();

    // Build worksheet data with requested columns
    const data = [
      [
        "Tanggal Lead Masuk", // use leadInAt as the main date
        "Tanggal Ditambahkan", // createdAt
        "Nama",
        "Kontak",
        "Email",
        "Properti",
        "Unit",
        "Status",
        "Milik",
        "Sumber",
      ],
    ];
    for (const r of rows) {
      data.push([
        new Date(r.leadInAt || r.createdAt).toISOString(),
        new Date(r.createdAt).toISOString(),
        r.name || "",
        r.contact || "",
        r.email || "",
        r.property?.name || r.propertyName || "",
        r.unit || "",
        r.status || "",
        r.agent?.name || "",
        r.source || "",
      ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-export-${new Date().toISOString().slice(0,10)}.xlsx"`,
      },
    });
  } catch (e) {
    console.error("Admin leads export error", e);
    return NextResponse.json({ success:false, error:"Gagal mengekspor" }, { status:500 });
  }
}
