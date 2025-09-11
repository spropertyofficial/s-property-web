import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";
import Lead from "@/lib/models/Lead";
import twilio from "twilio";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { leadId, message, mediaFile, mediaType } = body;
  if (!leadId || (!message && !mediaFile)) {
    return Response.json({ error: "leadId dan pesan/media wajib diisi" }, { status: 400 });
  }
  // Ambil data lead
  const lead = await Lead.findById(leadId);
  if (!lead) {
    return Response.json({ error: "Lead tidak ditemukan" }, { status: 404 });
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
    const toNumber = lead.contact;
    if (!toNumber) {
      return Response.json({ error: "Nomor WhatsApp (contact) tidak ditemukan pada lead." }, { status: 400 });
    }
    const twilioPayload = {
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toNumber}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || "https://af12a559e28b.ngrok-free.app"}/api/whatsapp/webhook`,
    };
    if (message) twilioPayload.body = message;
    if (mediaUrl) twilioPayload.mediaUrl = mediaUrl;
    const twilioRes = await client.messages.create(twilioPayload);
    // Simpan pesan ke ChatMessage
    const chatMsg = await ChatMessage.create({
      lead: lead._id,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: message,
      direction: "outbound",
      status: "sent",
      twilioSid: twilioRes.sid,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      mediaTypes: mediaTypeFinal ? [mediaTypeFinal] : [],
    });
    return Response.json({ success: true, chatMsg });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}