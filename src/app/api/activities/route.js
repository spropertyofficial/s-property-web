import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import { verifyAdmin, verifyUser } from "@/lib/auth";
import ActivityType from "@/lib/models/ActivityType";

// GET: Mengambil log aktivitas
export async function GET(req) {
  try {
  await connectDB();

    // Try admin authentication first (for approval interface)
    const adminAuth = await verifyAdmin(req);
    if (adminAuth.success) {
      // Admin interface - show all activities with populated agent data
      if (adminAuth.admin.role === "superadmin") {
        const logs = await ActivityLog.find({})
          .populate("agent", "name agentCode email type") // Populate with user data
          .sort({ createdAt: -1, date: -1 }); // Sort by creation date, then activity date
        return NextResponse.json({ success: true, activities: logs });
      }
      // Other admin roles might have different permissions
      return NextResponse.json({ success: true, activities: [] });
    }

    // Try user authentication (for user interface)  
    const userAuth = await verifyUser(req);
    if (userAuth.success) {
      // User interface - show own activities
      const logs = await ActivityLog.find({ agent: userAuth.user._id }).sort({ date: -1 });
      return NextResponse.json({ success: true, activities: logs });
    }

    return NextResponse.json(
      { success: false, error: "Akses ditolak" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data aktivitas" },
      { status: 500 }
    );
  }
}

// POST: User membuat log aktivitas baru
export async function POST(req) {
  try {
    // Verify user instead of admin
    const { success, user } = await verifyUser(req);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak" },
        { status: 401 }
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

    console.log("User creating activity:", {
      userId: user._id,
      userName: user.name,
      userType: user.type,
      agentCode: user.agentCode
    });

    // Normalize date to UTC start-of-day
    let normalizedDate = date;
    try {
      if (typeof date === "string") {
        // Expecting format YYYY-MM-DD
        normalizedDate = new Date(`${date}T00:00:00.000Z`);
      } else if (date instanceof Date) {
        normalizedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
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

    // Resolve activity type from DB (active only)
    let atDoc = null;
    if (activityTypeId) {
      try {
        atDoc = await ActivityType.findOne({ _id: activityTypeId, isActive: true });
      } catch {}
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

    // Enforce at least one attachment (evidence)
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

    const newLog = new ActivityLog({
      agent: user._id,  // Use user._id instead of admin._id
      activityType: atDoc.name,
      activityTypeId: atDoc._id,
      date: normalizedDate,
      notes,
      status: "Pending", // Status default saat dibuat
      attachments: normalizedAttachments,
    });

    await newLog.save();
    
    console.log("Activity saved:", {
      activityId: newLog._id,
      agentId: newLog.agent,
  activityType: newLog.activityType,
      status: newLog.status
    });

    return NextResponse.json({
      success: true,
      message: "Aktivitas berhasil dicatat dan menunggu validasi.",
      log: newLog,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      const firstKey = Object.keys(error.errors)[0];
      const message = error.errors[firstKey]?.message || "Data tidak valid";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
