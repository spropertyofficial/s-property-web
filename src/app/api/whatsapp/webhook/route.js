import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import axios from "axios";
import streamifier from "streamifier";
import cloudinary from "@/lib/cloudinary";
import AgentQueue from "@/lib/models/AgentQueue";
import Project from "@/lib/models/Project";
import User from "@/lib/models/User";
import { sendMail } from "@/lib/email/sendMail";
import twilioClient from "@/lib/twilioClient";

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

  // Filter pesan notifikasi agar tidak diproses lebih lanjut
  if (Body && Body.toLowerCase().includes("notifikasi")) {
    console.log("Pesan notifikasi terdeteksi, tidak diproses lebih lanjut.");
    return NextResponse.json({ success: true, skipped: "notifikasi" });
  }

  // Jika webhook untuk status outbound (MessageStatus & MessageSid), update status pesan
  if (MessageSid && MessageStatus) {
    // Update status pesan outbound sesuai MessageSid
    await ChatMessage.findOneAndUpdate(
      { twilioSid: MessageSid },
      { status: MessageStatus }
    );
    console.log(
      `Update status ChatMessage SID ${MessageSid} => ${MessageStatus}`
    );
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

  let lead;
  if (Body && !Body.toLowerCase().includes("notifikasi")) {
    // Cari lead existing by contact
    lead = await Lead.findOne({ contact: From.replace("whatsapp:", "") });
    if (!lead) {
      // 1. Identifikasi proyek dari nomor tujuan (To)
      let normalizedTo = (To || "").replace("whatsapp:", "").trim();
      const project = await Project.findOne({ whatsappNumber: normalizedTo }).populate("agentQueue");
      // logging proyek
      console.log("exist agentQueue check:", project ? project : "tidak ada");


      // 2. Ambil queue proyek jika ada, else fallback ke queue umum (tanpa projectId)
      let queue = null;
      if (project && project.agentQueue) {
        queue = await AgentQueue.findById(project.agentQueue);
      }
      if (!queue) {
        // fallback queue umum (legacy)
        queue = await AgentQueue.findOne({ projectId: { $exists: false } });
        if (!queue) queue = await AgentQueue.findOne({ projectId: null });
      }
      // logging queue
      console.log("Queue untuk lead baru:", queue ? queue : "tidak ada");

      // 3. Round-robin di queue yang ditemukan
      let assignedAgent = null;
      let nextIndex = -1;
      if (queue && queue.agents && queue.agents.length > 0) {
        const activeAgents = queue.agents.filter((a) => a.active);
        if (activeAgents.length > 0) {
          nextIndex = (queue.lastAssignedIndex + 1) % activeAgents.length;
          assignedAgent = activeAgents[nextIndex].user;
          queue.lastAssignedIndex = nextIndex;
          queue.updatedAt = Date.now();
          await queue.save();
        }
      }

      // 4. Create lead baru
      lead = await Lead.create({
        name: "-",
        contact: From.replace("whatsapp:", ""),
        source: "WhatsApp",
        status: "Baru",
        agent: assignedAgent || null,
        isClaimed: false,
        leadInAt: Date.now(),
        assignedAt: Date.now(),
        propertyName: project ? project.name : undefined,
      });
      console.log("Lead baru dibuat:", lead.contact, project ? `(project=${project.name})` : "(no project)");

      // 5. Notifikasi ke agent yang ditugaskan (jika ada)
      if (assignedAgent) {
        const agentUser = await User.findById(assignedAgent);
        if (agentUser && agentUser.phone) {
          try {
            await twilioClient.messages.create({
              to: `whatsapp:${formatPhone(agentUser.phone)}`,
              from: `${process.env.TWILIO_WHATSAPP_NUMBER}`,
              contentSid: "HX0cdba500c0c9c3157678dd100cde6257",
            });
            console.log(`Notifikasi dikirim ke agent ${agentUser.phone}`);
          } catch (err) {
            console.error("Gagal kirim notifikasi ke agent:", err);
            const emailTo = "devranmalik82@gmail.com";
            const subject = `Gagal Notifikasi WhatsApp Lead Baru untuk Agent ${agentUser?.name || "(Unknown)"}`;
            const html = `<p>Ada lead baru dari WhatsApp untuk ${project ? `proyek <b>${project.name}</b>` : "(tanpa proyek)"}, tapi gagal kirim notifikasi ke agent <b>${agentUser?.name || "(Unknown)"}</b>.</p><p>Lead: ${lead?.contact || "(Unknown)"}</p>`;
            try { await sendMail({ to: emailTo, subject, html }); } catch (mailErr) { console.error("Gagal kirim email fallback notifikasi agent:", mailErr); }
          }
        }
      }
    } else {
      console.log("Lead sudah ada:", lead.contact);
    }
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
    if (body[`MediaContentType${i}`])
      mediaTypes.push(body[`MediaContentType${i}`]);
  }

  if (
    (Body || numMedia > 0) &&
    !(Body && Body.toLowerCase().includes("notifikasi"))
  ) {
    await ChatMessage.create({
      lead: lead._id,
      from: From.replace("whatsapp:", ""),
      to: To.replace("whatsapp:", ""),
      body: Body,
      direction: "inbound",
      status: "received",
      sentAt: Timestamp ? new Date(Timestamp) : Date.now(),
      mediaUrls,
      mediaTypes,
      ...body,
    });
  }

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
