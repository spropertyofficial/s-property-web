import dbConnect from "../../../../lib/dbConnect";
import ChatMessage from "../../../../lib/models/ChatMessage";
import Lead from "../../../../lib/models/Lead";
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
    const twilioRes = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${lead.phone}`,
    });
    // Simpan pesan ke ChatMessage
    const chatMsg = await ChatMessage.create({
      lead: lead._id,
      sender: "agent",
      content: message,
      timestamp: new Date(),
      twilioSid: twilioRes.sid,
    });
    return Response.json({ success: true, chatMsg });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}