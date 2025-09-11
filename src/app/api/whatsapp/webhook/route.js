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
    lead = await Lead.create({
      name: "-",
      contact: From.replace("whatsapp:", ""),
      source: "WhatsApp",
      status: "Baru"
    });
    console.log("Lead baru dibuat:", From.replace("whatsapp:", ""));
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
