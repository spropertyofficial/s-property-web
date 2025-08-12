import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityType from "@/lib/models/ActivityType";
import { verifyAdminWithRole } from "@/lib/auth";
import mongoose from "mongoose";

// PUT: update activity type (admin only)
export async function PUT(req, { params }) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { name, score, isActive, description } = body;

    await connectDB();

  const update = { updatedBy: auth.admin._id };
    if (name !== undefined) update.name = name.trim();
    if (score !== undefined) update.score = Number(score) || 0;
    if (isActive !== undefined) update.isActive = !!isActive;
    if (description !== undefined) update.description = description?.trim();

    const item = await ActivityType.findByIdAndUpdate(id, update, { new: true });
    if (!item) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const key = Object.keys(error.errors)[0];
      const message = error.errors[key]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: soft-delete (set isActive = false)
export async function DELETE(req, { params }) {
  try {
  const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
  if (auth.error) return auth.error;

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await connectDB();

    const item = await ActivityType.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: auth.admin._id },
      { new: true }
    );
    if (!item) {
      return NextResponse.json({ success: false, error: "Data tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
