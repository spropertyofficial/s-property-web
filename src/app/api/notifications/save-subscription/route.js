import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const subscription = body?.subscription;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    // Global de-duplication: remove this endpoint from ANY user first (handles account switch on same device)
    await User.updateMany(
      { "pushSubscriptions.endpoint": subscription.endpoint },
      { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } }
    );

    await User.updateOne(
      { _id: auth.user._id },
      {
        $push: {
          pushSubscriptions: {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime ?? null,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
            addedAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("save-subscription error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
