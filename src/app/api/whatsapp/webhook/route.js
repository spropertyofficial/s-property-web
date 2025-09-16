import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import querystring from "querystring";
import axios from "axios";
import streamifier from "streamifier";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  await dbConnect();
  const rawBody = await req.text();
  console.log("Twilio webhook rawBody:", rawBody);
  const body = require("querystring").parse(rawBody);
  console.log("Twilio webhook parsed body:", body);

  const { From, To, Body, MessageSid, Timestamp, MessageStatus } = body;
  console.log(
    "Twilio webhook From:",
    From,
    "To:",
    To,
    "Body:",
    Body,
    "MessageSid:",
    MessageSid,
    "Timestamp:",
    Timestamp
  );

  // Jika webhook untuk status outbound (MessageStatus & MessageSid), update status pesan
  if (MessageSid && MessageStatus) {
    // Update status pesan outbound sesuai MessageSid
    await ChatMessage.findOneAndUpdate(
      { twilioSid: MessageSid },
      { status: MessageStatus },
    );
    console.log(`Update status ChatMessage SID ${MessageSid} => ${MessageStatus}`);
    return NextResponse.json({ success: true });
  }
  // Jika webhook inbound (pesan masuk dari user)
  // Validasi: payload harus punya pengirim dan minimal ada teks ATAU media
  const numMedia = parseInt(body.NumMedia || "0", 10);
  if (!From || (!Body && numMedia === 0)) {
    console.log("Payload tidak valid", body);
    return NextResponse.json(
      { success: false, error: "Payload tidak valid" },
      { status: 400 }
    );
  }

  let lead = await Lead.findOne({ contact: From.replace("whatsapp:", "") });
  if (!lead) {
    // Ambil AgentQueue untuk round-robin
    const AgentQueue = (await import("@/lib/models/AgentQueue")).default;
    let queue = await AgentQueue.findOne({});
    let assignedAgent = null;
    let nextIndex = -1;
    if (queue && queue.agents && queue.agents.length > 0) {
      // Cari agent aktif berikutnya
      const activeAgents = queue.agents.filter(a => a.active);
      if (activeAgents.length > 0) {
        nextIndex = (queue.lastAssignedIndex + 1) % activeAgents.length;
        assignedAgent = activeAgents[nextIndex].user;
        // Update pointer rotasi
        queue.lastAssignedIndex = nextIndex;
        queue.updatedAt = Date.now();
        await queue.save();
      }
    }
    // Lead baru: agent belum di-assign, status unassigned
    lead = await Lead.create({
      name: "-",
      contact: From.replace("whatsapp:", ""),
      source: "WhatsApp",
      status: "Baru",
      agent: null // agent diisi saat claim
    });
    console.log("Lead baru dibuat:", From.replace("whatsapp:", ""));
    // Kirim notifikasi WhatsApp ke agent giliran
    if (assignedAgent) {
      // Ambil nomor agent
      const User = (await import("@/lib/models/User")).default;
      const agentUser = await User.findById(assignedAgent);
      if (agentUser && agentUser.phone) {
        // Kirim pesan WhatsApp via Twilio
        try {
          await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
            querystring.stringify({
              To: `whatsapp:${formatPhone(agentUser.phone)}`,
              From: `${process.env.TWILIO_WHATSAPP_NUMBER}`,
              Body: `Ada lead baru dari WhatsApp. Silakan klaim untuk segera merespon.`,
            }),
            {
              auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
              },
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );
          console.log(`Notifikasi dikirim ke agent ${agentUser.phone}`);
        } catch (err) {
          console.error("Gagal kirim notifikasi ke agent:", err);
        }
      }
    }
  } else {
    console.log("Lead sudah ada:", lead.contact);
  }

  // Ambil media jika ada
  const mediaUrls = [];
  const mediaTypes = [];
  for (let i = 0; i < numMedia; i++) {
    if (body[`MediaUrl${i}`]) {
      // Download media dari Twilio dan upload ke Cloudinary
      try {
        const twilioRes = await axios.get(body[`MediaUrl${i}`], {
          responseType: "arraybuffer",
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN,
          },
        });
        // Tentukan tipe resource Cloudinary
        const type = body[`MediaContentType${i}`] || "";
        const resourceType = type.startsWith("image") ? "image" : "auto";
        // Upload ke Cloudinary
        const cloudinaryUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "whatsapp-media", resource_type: resourceType },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          streamifier.createReadStream(twilioRes.data).pipe(uploadStream);
        });
        mediaUrls.push(cloudinaryUrl);
      } catch (err) {
        console.error("Gagal download/upload media Twilio:", err);
      }
    }
    if (body[`MediaContentType${i}`]) mediaTypes.push(body[`MediaContentType${i}`]);
  }

  await ChatMessage.create({
    lead: lead._id,
    from: From,
    to: To,
    body: Body,
    direction: "inbound",
    status: "received",
    sentAt: Timestamp ? new Date(Timestamp) : Date.now(),
    twilioSid: MessageSid,
    mediaUrls,
    mediaTypes,
  });

  console.log("Pesan berhasil disimpan untuk lead:", lead.contact);
  return NextResponse.json({ success: true });
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
