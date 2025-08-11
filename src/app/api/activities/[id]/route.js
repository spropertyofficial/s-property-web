import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import { verifyAdmin, verifyUser } from "@/lib/auth";
import mongoose from "mongoose";
import ActivityType from "@/lib/models/ActivityType";

// PUT: Admin memvalidasi (approve/reject) sebuah log ATAU User mengedit aktivitas pending
export async function PUT(req, { params }) {
  try {
    // Try admin authentication first (for approval)
    const adminAuth = await verifyAdmin(req);
    if (adminAuth.success && adminAuth.admin.role === "superadmin") {
      return await handleAdminApproval(req, params, adminAuth.admin);
    }

    // Try user authentication (for editing own activities)
    const userAuth = await verifyUser(req);
    if (userAuth.success) {
      return await handleUserEdit(req, params, userAuth.user);
    }

    return NextResponse.json(
      { success: false, error: "Akses ditolak" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error in PUT /api/activities/[id]:", error);
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      const message = error.errors[firstKey]?.message || "Data tidak valid";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: User menghapus aktivitas yang masih pending
export async function DELETE(req, { params }) {
  try {
    const { success, user } = await verifyUser(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID aktivitas tidak valid" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the activity and check ownership
    const activity = await ActivityLog.findById(id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Aktivitas tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if user owns this activity
    if (activity.agent.toString() !== user._id.toString()) {
      return NextResponse.json(
        {
          success: false,
          error: "Anda tidak memiliki izin untuk menghapus aktivitas ini",
        },
        { status: 403 }
      );
    }

    // Check if activity is still pending (only pending activities can be deleted)
    if (activity.status !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya aktivitas dengan status pending yang dapat dihapus",
        },
        { status: 400 }
      );
    }

    // Delete the activity
    await ActivityLog.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Aktivitas berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// Admin approval handler
async function handleAdminApproval(req, params, admin) {
  const { id } = params;
  const { status, rejectReason } = await req.json();

  if (!status || !["Approved", "Rejected"].includes(status)) {
    return NextResponse.json(
      { success: false, error: "Status tidak valid" },
      { status: 400 }
    );
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "ID aktivitas tidak valid" },
      { status: 400 }
    );
  }

  await connectDB();

  // Load activity first
  const activity = await ActivityLog.findById(id);
  if (!activity) {
    return NextResponse.json(
      { success: false, error: "Log aktivitas tidak ditemukan" },
      { status: 404 }
    );
  }

  let update = { $set: { status } };
  if (status === "Approved") {
    update.$set.approvedBy = admin._id;
    update.$set.approvedAt = new Date();
    update.$unset = { rejectReason: 1 };
    // Compute score from ActivityType in DB
    let atDoc = null;
    if (activity.activityTypeId) {
      try { atDoc = await ActivityType.findById(activity.activityTypeId); } catch {}
    }
    if (!atDoc && activity.activityType) {
      atDoc = await ActivityType.findOne({ name: activity.activityType });
    }
    const baseScore = Math.max(0, Number(atDoc?.score || 0));
    update.$set.score = baseScore;
  } else if (status === "Rejected") {
    if (!rejectReason || !rejectReason.trim()) {
      return NextResponse.json(
        { success: false, error: "Alasan penolakan wajib diisi" },
        { status: 400 }
      );
    }
    update.$set.rejectReason = rejectReason.trim();
    update.$set.approvedBy = admin._id; // pencatat aksi
    update.$set.approvedAt = new Date();
    update.$set.score = 0;
  }

  const updatedLog = await ActivityLog.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!updatedLog) {
    return NextResponse.json(
      { success: false, error: "Log aktivitas tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Aktivitas berhasil di-${status.toLowerCase()}`,
    log: updatedLog,
  });
}

// User edit handler
async function handleUserEdit(req, params, user) {
  const { id } = params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "ID aktivitas tidak valid" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { activityType: activityTypeName, activityTypeId, date, notes, attachments } = body;

  if ((!activityTypeId && !activityTypeName) || !date) {
    return NextResponse.json(
      { success: false, error: "Jenis aktivitas dan tanggal wajib diisi" },
      { status: 400 }
    );
  }

  await connectDB();

  // Find the activity and check ownership
  const activity = await ActivityLog.findById(id);
  if (!activity) {
    return NextResponse.json(
      { success: false, error: "Aktivitas tidak ditemukan" },
      { status: 404 }
    );
  }

  // Check if user owns this activity
  if (activity.agent.toString() !== user._id.toString()) {
    return NextResponse.json(
      {
        success: false,
        error: "Anda tidak memiliki izin untuk mengedit aktivitas ini",
      },
      { status: 403 }
    );
  }

  // Check if activity is still pending (only pending activities can be edited)
  if (activity.status !== "Pending") {
    return NextResponse.json(
      {
        success: false,
        error: "Hanya aktivitas dengan status pending yang dapat diedit",
      },
      { status: 400 }
    );
  }

  // Normalize date to UTC start-of-day
  let normalizedDate = date;
  try {
    if (typeof date === "string") {
      normalizedDate = new Date(`${date}T00:00:00.000Z`);
    } else if (date instanceof Date) {
      normalizedDate = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
      );
    } else {
      normalizedDate = new Date(date);
    }
    if (isNaN(normalizedDate.getTime())) throw new Error("Invalid date");
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Tanggal tidak valid" },
      { status: 400 }
    );
  }

  // Resolve ActivityType from DB (active only for edits)
  let atDoc = null;
  if (activityTypeId) {
    try { atDoc = await ActivityType.findOne({ _id: activityTypeId, isActive: true }); } catch {}
  }
  if (!atDoc && activityTypeName) {
    atDoc = await ActivityType.findOne({ name: activityTypeName.trim(), isActive: true });
  }
  if (!atDoc) {
    return NextResponse.json(
      { success: false, error: "Jenis aktivitas tidak valid atau non-aktif" },
      { status: 400 }
    );
  }

  // Optional notes length guard (schema also validates)
  if (notes && notes.length > 1000) {
    return NextResponse.json(
      { success: false, error: "Catatan maksimal 1000 karakter" },
      { status: 400 }
    );
  }

  // Enforce at least one attachment (evidence) on edit as well
  const normalizedAttachments = Array.isArray(attachments)
    ? attachments
        .map((a) => ({
          url: a?.url || a?.src,
          publicId: a?.publicId,
          size: a?.size,
          mimeType: a?.mimeType,
          width: a?.width,
          height: a?.height,
        }))
        .filter((a) => !!a.url)
    : [];
  if (normalizedAttachments.length < 1) {
    return NextResponse.json(
      { success: false, error: "Minimal 1 bukti gambar wajib diunggah" },
      { status: 400 }
    );
  }

  // Update the activity
  const updatedActivity = await ActivityLog.findByIdAndUpdate(
    id,
    {
      activityType: atDoc.name,
      activityTypeId: atDoc._id,
      date: normalizedDate,
      notes,
      attachments: normalizedAttachments,
    },
    { new: true }
  );

  return NextResponse.json({
    success: true,
    message: "Aktivitas berhasil diperbarui",
    activity: updatedActivity,
  });
}
