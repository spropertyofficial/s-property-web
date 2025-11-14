import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AgentQueue from "@/lib/models/AgentQueue";
import Project from "@/lib/models/Project";
import querystring from "querystring";
import { sendPushToUser } from "@/lib/push";
import User from "@/lib/models/User";
import axios from "axios";

export async function GET(req) {
  await dbConnect();
  // Validasi kunci rahasia dari header Authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Akses tidak diizinkan" },
      { status: 401 }
    );
  }

  // Cari leads yang belum diklaim (isClaimed == false, source WhatsApp) dan assignedAt sudah lewat threshold eskalasi
  let escalated = [];
  // Ambil threshold waktu eskalasi default (fallback)
  const fallbackQueue = 
    (await AgentQueue.findOne({ projectId: { $exists: false } })) ||
    (await AgentQueue.findOne({ projectId: null }));
  const fallbackEscalationMinutes = fallbackQueue?.escalationMinutes ?? 5;
  const threshold = Date.now() - fallbackEscalationMinutes * 60 * 1000;
  const unclaimedLeads = await Lead.find({
    isClaimed: false,
    source: "Leads Kantor",
    assignedAt: { $lte: new Date(threshold) },
  });

  // logging leads yang ditemukan
  console.log("Leads yang ditemukan:", unclaimedLeads);

  for (const lead of unclaimedLeads) {
    // Identifikasi proyek dari propertyName (atau bisa dari nomor tujuan jika disimpan di lead)
    let queue = null;
    let escalationMinutes = fallbackEscalationMinutes;
    if (lead.propertyName) {
      const project = await Project.findOne({
        name: lead.propertyName,
      }).populate("agentQueue");
      // logging proyek per lead
      console.log("Proyek untuk satu lead:", project ? project : "tidak ada");
      if (project && project.agentQueue) {
        queue = await AgentQueue.findById(project.agentQueue);
        escalationMinutes =
          queue?.escalationMinutes ?? fallbackEscalationMinutes;
      }
    }
    if (!queue) {
      queue = fallbackQueue;
    }
    const activeAgents = queue?.agents?.filter((a) => a.active) || [];
    if (activeAgents.length > 0) {
      const currentAgentIndex = activeAgents.findIndex(
        (a) => a.user.toString() === lead.agent?.toString()
      );
      const nextIndex =
        currentAgentIndex >= 0
          ? (currentAgentIndex + 1) % activeAgents.length
          : 0;
      const nextAgentId = activeAgents[nextIndex].user;
      lead.agent = nextAgentId;
      lead.assignedIndex = nextIndex;
      lead.assignedAt = Date.now();
      await lead.save();
      if (queue) {
        queue.lastAssignedIndex = nextIndex;
        queue.updatedAt = Date.now();
        await queue.save();
      }
      try {
        const agentUser = await User.findById(nextAgentId).select("name pushSubscriptions");
        if (agentUser) {
          const payload = {
            title: "Lead dialihkan ke Anda",
            body: "Lead baru telah dialihkan ke Anda. Mohon segera diklaim.",
            url: "/chat",
            tag: "lead-alert",
            icon: "/android/android-launchericon-192-192.png",
            badge: "/android/android-launchericon-192-192.png",
            requireInteraction: true,
            renotify: true,
            timestamp: Date.now(),
            vibrate: [120, 60, 120],
          };
          const res = await sendPushToUser(agentUser, payload);
          if (!res || res.sent === 0) {
            console.warn("Web Push not sent for escalation (no subs or disabled)");
          }
        }
      } catch (err) {
        console.error("Gagal kirim notifikasi push ke agent:", err);
      }
      escalated.push({
        leadId: lead._id,
        nextAgent: nextAgentId,
        queue: queue?._id,
      });
    }
  }
  // Note: phone formatting helper removed since Twilio fallback is no longer used here
  //  Logging hasil eskalasi
  console.log("Leads yang di-escalate:", escalated);
  return NextResponse.json({
    success: true,
    escalated,
    count: escalated.length,
  });
}
