import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";
import Lead from "@/lib/models/Lead";
import twilio from "twilio";

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { leadId, message } = body;
  if (!leadId || !message) {
    return Response.json({ error: "leadId dan message wajib diisi" }, { status: 400 });
  }
  // Ambil data lead
  const lead = await Lead.findById(leadId);
  if (!lead) {
    return Response.json({ error: "Lead tidak ditemukan" }, { status: 404 });
  }
  // Kirim pesan ke WhatsApp via Twilio
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const toNumber = lead.contact;
    if (!toNumber) {
      return Response.json({ error: "Nomor WhatsApp (contact) tidak ditemukan pada lead." }, { status: 400 });
    }
    const twilioRes = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toNumber}`,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || "https://af12a559e28b.ngrok-free.app"}/api/whatsapp/webhook`,
    });
    // Simpan pesan ke ChatMessage
    const chatMsg = await ChatMessage.create({
      lead: lead._id,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: message,
      direction: "outbound",
      status: "sent",
      twilioSid: twilioRes.sid,
    });
    return Response.json({ success: true, chatMsg });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}