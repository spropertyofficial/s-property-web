
import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";
import Lead from "@/lib/models/Lead";
import Project from "@/lib/models/Project";
import twilio from "twilio";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { leadId, contact, propertyName, message, mediaFile, mediaType } = body;
  if (!contact || !propertyName || (!message && !mediaFile)) {
    return Response.json({ error: "contact, propertyName, dan pesan/media wajib diisi" }, { status: 400 });
  }
  // Cari nomor WhatsApp dari Project
  const project = await Project.findOne({ name: propertyName });
  if (!project || !project.whatsappNumber) {
    return Response.json({ error: "Project atau nomor WhatsApp tidak ditemukan" }, { status: 404 });
  }
  // Upload media ke Cloudinary jika ada
  let mediaUrl = null;
  let mediaTypeFinal = null;
  if (mediaFile && mediaType) {
    try {
      // mediaFile: base64 string dari frontend
      const buffer = Buffer.from(mediaFile, 'base64');
      const resourceType = mediaType.startsWith("image") ? "image" : "auto";
      mediaUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "whatsapp-media", resource_type: resourceType },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
      mediaTypeFinal = mediaType;
    } catch (err) {
      return Response.json({ error: "Gagal upload media: " + err.message }, { status: 500 });
    }
  }
  // Kirim pesan ke WhatsApp via Twilio
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const toNumber = contact;
    const fromNumber = `whatsapp:${project.whatsappNumber}`;
    const twilioPayload = {
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.sproperty.co.id"}/api/whatsapp/webhook`,
    };
    if (message) twilioPayload.body = message;
    if (mediaUrl) twilioPayload.mediaUrl = mediaUrl;
    let twilioRes;
    try {
      twilioRes = await client.messages.create(twilioPayload);
    } catch (twilioErr) {
      // Jika gagal kirim ke Twilio, jangan simpan ChatMessage, kembalikan error
      console.error("Error kirim pesan via Twilio:", twilioErr);
      return Response.json({ error: "Gagal kirim pesan WhatsApp:"}, { status: 500 });
    }
    // Simpan ChatMessage (tanpa relasi lead, karena leadId tidak dikirim)
    const chatMsg = await ChatMessage.create({
      lead: leadId,
      from: fromNumber,
      to: toNumber,
      body: message,
      direction: "outbound",
      status: "sent",
      twilioSid: twilioRes.sid,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      mediaTypes: mediaTypeFinal ? [mediaTypeFinal] : [],
      propertyName,
    });
    return Response.json({ success: true, chatMsg });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}