import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyAuth } from "@/lib/auth";

// Remove a single push subscription (by endpoint) for the authenticated user.
// Accepts JSON: { endpoint: string }
// If subscription not found, responds success:true (idempotent deletion).
export async function POST(req) {
  try {
    await dbConnect();
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const endpoint = body?.endpoint;
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json(
        { success: false, error: "Endpoint tidak valid" },
        { status: 400 }
      );
    }

    // Pull the subscription matching endpoint
    await User.updateOne(
      { _id: auth.user._id },
      { $pull: { pushSubscriptions: { endpoint } } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("remove-subscription error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus subscription" },
      { status: 500 }
    );
  }
}
