import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import querystring from "querystring";
import axios from "axios";
import streamifier from "streamifier";
import cloudinary from "@/lib/cloudinary";
import AgentQueue from "@/lib/models/AgentQueue";
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
    lead = await Lead.findOne({ contact: From.replace("whatsapp:", "") });
    if (!lead) {
      // Ambil AgentQueue untuk round-robin
      let queue = await AgentQueue.findOne({});
      let assignedAgent = null;
      let nextIndex = -1;
      if (queue && queue.agents && queue.agents.length > 0) {
        // Cari agent aktif berikutnya
        const activeAgents = queue.agents.filter((a) => a.active);
        if (activeAgents.length > 0) {
          nextIndex = (queue.lastAssignedIndex + 1) % activeAgents.length;
          assignedAgent = activeAgents[nextIndex].user;
          // Update pointer rotasi
          queue.lastAssignedIndex = nextIndex;
          queue.updatedAt = Date.now();
          await queue.save();
        }
      }
      // Lead baru: langsung di-assign ke agent giliran, status belum diklaim
      lead = await Lead.create({
        name: "-",
        contact: From.replace("whatsapp:", ""),
        source: "WhatsApp",
        status: "Baru",
        agent: assignedAgent || null,
        isClaimed: false,
        leadInAt: Date.now(),
        assignedAt: Date.now(),
      });

      console.log("Lead baru dibuat:", From.replace("whatsapp:", ""));
      // Kirim notifikasi WhatsApp ke agent giliran
      if (assignedAgent) {
        // Ambil nomor agent
        const agentUser = await User.findById(assignedAgent);
        if (agentUser && agentUser.phone) {
          // Kirim pesan WhatsApp via Twilio SDK
          try {
            await twilioClient.messages.create({
              to: `whatsapp:${formatPhone(agentUser.phone)}`,
              from: `${process.env.TWILIO_WHATSAPP_NUMBER}`,
              contentSid: "HX3652630ca44e763813ee128c27fb1d1b",
            });
            console.log(`Notifikasi dikirim ke agent ${agentUser.phone}`);
          } catch (err) {
            console.error("Gagal kirim notifikasi ke agent:", err);
            // Fallback: kirim email jika WhatsApp gagal
            const emailTo = "devranmalik82@gmail.com";
            const subject = `Gagal Notifikasi WhatsApp Lead Baru untuk Agent ${
              agentUser?.name || "(Unknown)"
            }`;
            const html = `<p>Ada lead baru dari WhatsApp, tapi gagal kirim notifikasi ke agent <b>${
              agentUser?.name || "(Unknown)"
            }</b> karena nomor WhatsApp tidak ditemukan atau Twilio error.</p> <p>Lead: ${
              lead?.contact || "(Unknown)"
            }</p>`;
            try {
              await sendMail({ to: emailTo, subject, html });
            } catch (mailErr) {
              console.error(
                "Gagal kirim email fallback notifikasi agent:",
                mailErr
              );
            }
          }
        } else {
          // Fallback: kirim email jika nomor WhatsApp agent tidak ada
          const emailTo = "devranmalik82@gmail.com";
          const subject = `Gagal Notifikasi WhatsApp Lead Baru untuk Agent ${
            agentUser?.name || "(Unknown)"
          }`;
          const html = `<p>Ada lead baru dari WhatsApp, tapi gagal kirim notifikasi ke agent <b>${
            agentUser?.name || "(Unknown)"
          }</b> karena nomor WhatsApp tidak ditemukan.</p> <p>Lead: ${
            lead?.contact || "(Unknown)"
          }</p>`;
          try {
            await sendMail({ to: emailTo, subject, html });
          } catch (mailErr) {
            console.error(
              "Gagal kirim email fallback notifikasi agent:",
              mailErr
            );
          }
        }
      }
      // Lead baru: langsung di-assign ke agent giliran, status belum diklaim

      console.log("Lead baru dibuat:", From.replace("whatsapp:", ""));
      // Kirim notifikasi WhatsApp ke agent giliran
      if (assignedAgent) {
        // Ambil nomor agent
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
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );
            console.log(`Notifikasi dikirim ke agent ${agentUser.phone}`);
          } catch (err) {
            console.error("Gagal kirim notifikasi ke agent:", err);
          }
        } else {
          // Kirim notifikasi fallback ke email jika nomor agent tidak ditemukan
          const emailTo = "devranmalik82@gmail.com";
          const subject = `Gagal Notifikasi WhatsApp Lead Baru untuk Agent ${
            agentUser?.name || "(Unknown)"
          }`;
          const html = `<p>Ada lead baru dari WhatsApp, tapi gagal kirim notifikasi ke agent <b>${
            agentUser?.name || "(Unknown)"
          }</b> karena nomor WhatsApp tidak ditemukan.</p> <p>Lead: ${
            lead?.contact || "(Unknown)"
          }</p>`;
          try {
            await sendMail({ to: emailTo, subject, html });
          } catch (mailErr) {
            console.error(
              "Gagal kirim email fallback notifikasi agent:",
              mailErr
            );
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

  if (Body && !Body.toLowerCase().includes("notifikasi")) {
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
