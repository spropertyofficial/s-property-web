import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { verifyAdminWithRole } from "@/lib/auth";
import SaleRecord from "@/lib/models/SaleRecord";
import mongoose from "mongoose";

// PUT /api/sales-records/[id]
export async function PUT(req, { params }) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const update = {};

    const allow = [
      "agentId",
      "projectId",
      "projectName",
      "block",
      "unitType",
      "tanggalClosing",
      "hargaPropertiTerjual",
      "status",
  "assetTypeId",
      "notes",
      "attachments",
    ];
    for (const k of allow) {
      if (k in body) update[k] = body[k];
    }

    // Normalize
    if (update.projectName !== undefined) update.projectName = update.projectName?.trim() || undefined;
    if (update.block !== undefined) update.block = update.block?.trim();
    if (update.unitType !== undefined) update.unitType = update.unitType?.trim();
    if (update.tanggalClosing) update.tanggalClosing = new Date(update.tanggalClosing);
    if (update.hargaPropertiTerjual !== undefined) update.hargaPropertiTerjual = Number(update.hargaPropertiTerjual);
  if (update.status && !["Closing", "Cancelled"].includes(update.status)) {
      return NextResponse.json({ success: false, error: "Status tidak valid" }, { status: 400 });
    }
    if (Array.isArray(update.attachments)) {
      update.attachments = update.attachments
        .map((a) => ({
          url: a?.url || a?.src,
          publicId: a?.publicId,
          size: a?.size,
          mimeType: a?.mimeType,
          width: a?.width,
          height: a?.height,
        }))
        .filter((a) => !!a.url);
    }

  update.updatedBy = auth.admin._id;

    const doc = await SaleRecord.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!doc) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, record: doc });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      const message = error.errors[firstKey]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error("PUT /api/sales-records/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE /api/sales-records/[id]
export async function DELETE(req, { params }) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }
    await connectDB();
    const del = await SaleRecord.findByIdAndDelete(id);
    if (!del) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sales-records/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
