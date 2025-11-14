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
import { sendPushToUser } from "@/lib/push";

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
  let project = null;
  let isNewLeadCreated = false;
  if (Body && !Body.toLowerCase().includes("notifikasi")) {
    // 1. Identifikasi proyek dari nomor tujuan (To)
    let normalizedTo = (To || "").replace("whatsapp:", "").trim();
    project = await Project.findOne({ whatsappNumber: normalizedTo }).populate("agentQueue");
    // logging proyek
    console.log("exist agentQueue check:", project ? project : "tidak ada");

    // 2. Cari lead existing by contact DAN project
    const contactVal = From.replace("whatsapp:", "");
    lead = await Lead.findOne({ contact: contactVal, propertyName: project ? project.name : undefined });

    if (!lead) {
      // Cek: apakah ada lead lain dengan contact ini (tapi project berbeda)?
      const leadAnyProject = await Lead.findOne({ contact: contactVal });
      if (!leadAnyProject || (leadAnyProject && (leadAnyProject.propertyName !== (project ? project.name : undefined)))) {
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
          contact: contactVal,
          source: "Leads Kantor",
          status: "Baru",
          agent: assignedAgent || null,
          isClaimed: false,
          leadInAt: Date.now(),
          assignedAt: Date.now(),
          propertyName: project ? project.name : undefined,
        });
        isNewLeadCreated = true;
        console.log("Lead baru dibuat:", lead.contact, project ? `(project=${project.name})` : "(no project)");

        // 5. Notifikasi ke agent yang ditugaskan (jika ada) via Web Push
        if (assignedAgent) {
          const agentUser = await User.findById(assignedAgent).select("name pushSubscriptions");
          if (agentUser) {
            const subsCount = Array.isArray(agentUser.pushSubscriptions) ? agentUser.pushSubscriptions.length : 0;
            console.log("Assigned agent for push:", {
              agentId: assignedAgent?.toString?.(),
              name: agentUser?.name,
              subsCount,
            });
            const payload = {
              title: project ? `Lead baru (${project.name})` : "Lead baru masuk",
              body: `Anda memiliki 5 menit untuk merespons.`,
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
              console.warn("Web Push not sent (no subs or disabled). Consider adding a fallback.");
              if (res?.disabled) {
                console.warn("Reason: Web Push disabled (missing VAPID envs)");
              }
              const emailTo = "devranmalik82@gmail.com";
              const subject = `Lead Baru Masuk${project ? ` (${project.name})` : ""}`;
              const html = `<p>Ada lead baru dari WhatsApp${project ? ` untuk proyek <b>${project.name}</b>` : ""}.</p><p>Lead: ${lead?.contact || "(Unknown)"}</p>`;
              try { await sendMail({ to: emailTo, subject, html }); } catch (mailErr) { console.error("Gagal kirim email fallback notifikasi agent:", mailErr); }
            }
          }
        }
      } else {
        // Sudah ada lead untuk contact ini (project lain), tidak buat baru, gunakan leadAnyProject
        lead = leadAnyProject;
        console.log("Lead sudah ada untuk contact (project lain):", lead.contact);
      }
    } else {
      console.log("Lead sudah ada untuk contact+project:", lead.contact, project ? `(project=${project.name})` : "(no project)");
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
    const chatMsg = await ChatMessage.create({
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
    // Update lastMessageAt pada Lead
    await Lead.findByIdAndUpdate(lead._id, { lastMessageAt: chatMsg.sentAt || new Date() });

    // Kirim push juga untuk pesan inbound pada lead yang sudah ada (hindari duplikasi saat lead baru dibuat)
    try {
      if (!isNewLeadCreated && lead?.agent) {
        const agentUser = await User.findById(lead.agent).select("name pushSubscriptions");
        if (agentUser) {
          const subsCount = Array.isArray(agentUser.pushSubscriptions) ? agentUser.pushSubscriptions.length : 0;
          console.log("Inbound push to assigned agent:", {
            agentId: lead.agent?.toString?.(),
            name: agentUser?.name,
            subsCount,
            leadId: lead?._id?.toString?.(),
          });
          const payload = {
            title: project ? `Pesan baru (${project.name})` : "Pesan baru masuk",
            body: `Anda memiliki pesan baru dari ${lead?.contact || "(Unknown)"}.`,
            url: "/chat",
            tag: `lead-inbound:${lead?._id}`,
            icon: "/android/android-launchericon-192-192.png",
            badge: "/android/android-launchericon-192-192.png",
            renotify: true,
            timestamp: Date.now(),
            silent: false,
            vibrate: [120, 60, 120],

          };
          const resInbound = await sendPushToUser(agentUser, payload);
          if (!resInbound || resInbound.sent === 0) {
            console.warn("Inbound Web Push not sent (no subs or disabled)", resInbound);
          }
        }
      }
    } catch (pushErr) {
      console.error("Failed to send inbound push:", pushErr);
    }
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
