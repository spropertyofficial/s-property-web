import webpush from "web-push";
import dbConnect from "@/lib/mongodb";
import User from "@/lib/models/User";

let configured = false;

function configure() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@localhost";
  if (!publicKey || !privateKey) {
    console.warn("VAPID keys missing: Web Push will be disabled.");
    configured = false;
    return;
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  } catch (e) {
    console.error("Failed to configure web-push:", e);
    configured = false;
  }
}

/**
 * Send a Web Push notification to all active subscriptions of a user.
 * payload should be a small JSON-serializable object, e.g. { title, body, url, tag, icon, badge }
 * Returns a summary { sent, failed, pruned }
 */
export async function sendPushToUser(userOrId, payload) {
  await dbConnect();
  configure();
  if (!configured) {
    return { sent: 0, failed: 0, pruned: 0, disabled: true };
  }

  let user = userOrId;
  if (!user || !user.pushSubscriptions) {
    user = await User.findById(userOrId).select("pushSubscriptions name email");
  }
  if (!user) return { sent: 0, failed: 0, pruned: 0, error: "User not found" };
  const subs = user.pushSubscriptions || [];
  if (subs.length === 0) return { sent: 0, failed: 0, pruned: 0 };

  const body = JSON.stringify(payload || {});
  const results = await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub, body).catch((e) => { throw { error: e, endpoint: sub.endpoint }; }))
  );

  let sent = 0;
  let failed = 0;
  const toPrune = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") sent++;
    else {
      failed++;
      const err = r.reason?.error || r.reason;
      const endpoint = r.reason?.endpoint || subs[i]?.endpoint;
      const statusCode = err?.statusCode || err?.status || err?.code;
      // 410 Gone, 404 Not Found, 403 Forbidden are typical for invalid/expired subscriptions
      if (endpoint && (statusCode === 410 || statusCode === 404 || statusCode === 403)) {
        toPrune.push(endpoint);
      }
      // Log other errors for visibility
      if (!toPrune.includes(endpoint)) {
        console.warn("Web Push send failed", { endpoint, statusCode, message: err?.message });
      }
    }
  }

  let pruned = 0;
  if (toPrune.length > 0) {
    const unique = Array.from(new Set(toPrune));
    await User.updateOne(
      { _id: user._id },
      { $pull: { pushSubscriptions: { endpoint: { $in: unique } } } }
    );
    pruned = unique.length;
  }

  return { sent, failed, pruned };
}

const push = { sendPushToUser };
export default push;
