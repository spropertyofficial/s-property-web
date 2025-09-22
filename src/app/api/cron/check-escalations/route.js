import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/lib/models/Lead';
import AgentQueue from '@/lib/models/AgentQueue';
import querystring from 'querystring';
import User from '@/lib/models/User';
import axios from 'axios';

export async function GET(req) {
  await dbConnect();
  // Validasi kunci rahasia dari header Authorization
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Akses tidak diizinkan' }, { status: 401 });
  }

  // Ambil agent queue dan waktu eskalasi
  const queue = await AgentQueue.findOne({});
  const escalationMinutes = queue?.escalationMinutes ?? 5;
  const activeAgents = queue?.agents?.filter(a => a.active) || [];

  // Cari leads yang belum diklaim (isClaimed == false, source WhatsApp) dan sudah masuk lebih lama dari waktu eskalasi
  const threshold = Date.now() - escalationMinutes * 60 * 1000;
  const unclaimedLeads = await Lead.find({ isClaimed: false, source: "WhatsApp", leadInAt: { $lte: new Date(threshold) } });

  let escalated = [];
  for (const lead of unclaimedLeads) {
    if (activeAgents.length > 0) {
      // Cari index agent saat ini di daftar activeAgents
      const currentAgentIndex = activeAgents.findIndex(a => a.user.toString() === lead.agent?.toString());
      // Jika agent tidak ditemukan, default ke 0
      const nextIndex = currentAgentIndex >= 0 ? (currentAgentIndex + 1) % activeAgents.length : 0;
      const nextAgentId = activeAgents[nextIndex].user;
      // Update agent dan assignedIndex pada lead
      lead.agent = nextAgentId;
      lead.assignedIndex = nextIndex;
      await lead.save();
      // Kirim notifikasi WhatsApp ke agent berikutnya
      try {
        const agentUser = await User.findById(nextAgentId);
        if (agentUser && agentUser.phone) {
          await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
            querystring.stringify({
              To: `whatsapp:${formatPhone(agentUser.phone)}`,
              From: `${process.env.TWILIO_WHATSAPP_NUMBER}`,
              Body: `Ada lead yang belum diambil. Silakan klaim untuk segera merespon.`,
            }),
            {
              auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
              },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );
        }
      } catch (err) {
        console.error('Gagal kirim notifikasi ke agent:', err);
      }
      escalated.push({ leadId: lead._id, nextAgent: nextAgentId });
    }
  }
// Helper untuk format nomor telepon ke +62
function formatPhone(phone) {
  if (!phone) return "";
  let p = phone.trim();
  // Hilangkan spasi, strip, titik
  p = p.replace(/[-.\s]/g, "");
  // Jika sudah +62, return
  if (p.startsWith("+62")) return p;
  // Jika 62 tanpa +, tambahkan +
  if (p.startsWith("62")) return "+" + p;
  // Jika 08, ubah ke +628
  if (p.startsWith("08")) return "+62" + p.slice(1);
  // Default: return apa adanya
  return p;
}

  return NextResponse.json({ success: true, escalated, count: escalated.length });
}
