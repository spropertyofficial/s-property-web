import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AgentQueue from "@/lib/models/AgentQueue";
import User from "@/lib/models/User";
import axios from "axios";
import querystring from "querystring";

// Endpoint untuk eskalasi otomatis lead yang belum di-claim
// Jalankan secara periodik (misal pakai cron atau scheduler)
export async function POST() {
  await dbConnect();
  // Cari semua lead yang belum di-assign dan sudah lewat X menit sejak dibuat
  let X_MINUTES = 10; // default waktu tunggu sebelum eskalasi
  // Bisa diubah lewat query param atau body
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.searchParams.has('minutes')) {
      X_MINUTES = parseInt(url.searchParams.get('minutes'), 10) || X_MINUTES;
    }
  } catch {}
  try {
    const body = await req.json();
    if (body && body.minutes) {
      X_MINUTES = parseInt(body.minutes, 10) || X_MINUTES;
    }
  } catch {}
  const threshold = new Date(Date.now() - X_MINUTES * 60 * 1000);
  const unclaimedLeads = await Lead.find({ agent: null, createdAt: { $lte: threshold } });

  if (unclaimedLeads.length === 0) return NextResponse.json({ success: true, escalated: 0 });

  // Ambil AgentQueue
  const queue = await AgentQueue.findOne({});
  if (!queue || !queue.agents || queue.agents.length === 0)
    return NextResponse.json({ success: false, error: "Queue agent kosong" }, { status: 400 });
  const activeAgents = queue.agents.filter(a => a.active);

  let escalatedCount = 0;
  for (const lead of unclaimedLeads) {
    // Cari agent berikutnya (rotasi)
    let nextIndex = (queue.lastAssignedIndex + 1) % activeAgents.length;
    let nextAgent = activeAgents[nextIndex].user;
    // Update pointer rotasi
    queue.lastAssignedIndex = nextIndex;
    queue.updatedAt = Date.now();
    await queue.save();
    // Kirim notifikasi ke agent berikutnya
    const agentUser = await User.findById(nextAgent);
    if (agentUser && agentUser.phone) {
      try {
        await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          querystring.stringify({
            To: `whatsapp:+6289666000506`,
            // To: `whatsapp:${agentUser.phone}`,
            // From: process.env.TWILIO_WHATSAPP_NUMBER,
            From: `whatsapp:+14155238886`,
            Body: `Lead belum di-claim. Giliran Anda untuk menangani lead dari ${lead.contact}. Silakan claim jika ingin menangani.`,
          }),
          {
            auth: {
              username: process.env.TWILIO_ACCOUNT_SID,
              password: process.env.TWILIO_AUTH_TOKEN,
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          }
        );
      } catch (err) {
        console.error("Gagal kirim notifikasi eskalasi:", err);
      }
    }
    escalatedCount++;
  }

  return NextResponse.json({ success: true, escalated: escalatedCount });
}
