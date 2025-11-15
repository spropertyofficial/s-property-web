import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendPushToUser } from "@/lib/push";

export async function POST(req) {
  try {
    const auth = await verifyAuth(req);
    if (!auth?.success) {
      return NextResponse.json({ success: false, error: auth?.error || "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const uniqueTag = body?.tag || `test-push:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const payload = {
      title: body?.title || "Lead baru masuk",
      body: body?.body || "Anda memiliki 5 menit untuk merespons",
      url: body?.url || "/leads",
      tag: uniqueTag,
      icon: body?.icon || "/android/android-launchericon-192-192.png",
      badge: body?.badge || "/android/android-launchericon-192-192.png",
      renotify: true,
      timestamp: Date.now(),
      silent: false,
      vibrate: [100, 50, 100],
    };

    const result = await sendPushToUser(auth.user._id, payload);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("notifications/test error:", err);
    return NextResponse.json({ success: false, error: "Failed to send test notification" }, { status: 500 });
  }
}

export async function GET(req) {
  // Convenience: allow GET to send a simple test too
  return POST(req);
}
