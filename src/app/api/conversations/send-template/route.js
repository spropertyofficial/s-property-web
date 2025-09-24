
import { NextResponse } from "next/server";
import twilioClient from "@/lib/twilioClient";
import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";
import Lead from "@/lib/models/Lead";

// Mapping templateKey ke contentSid dan body
const TEMPLATE_MAP = {
  followup: {
    sid: "HX6faea0c28bc82ecd47eae64dc9f4c563",
    body: "Halo Bapak/Ibu. Menindaklanjuti pesan sebelumnya, apa ada pertanyaan lagi?",
  },
  reminder: {
    sid: "HX0dfd01212.......",
    body: "Kami ingin mengingatkan Anda tentang penawaran kami. Silakan hubungi kami jika tertarik.",
  },
  // Tambahkan template lain sesuai kebutuhan
};

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { contact, leadId, templateKey } = body;
  try {
    // Cari lead
    const lead = leadId ? await Lead.findById(leadId) : await Lead.findOne({ contact });
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
    }
    const toNumber = contact;
    const template = TEMPLATE_MAP[templateKey];
    if (!template) {
      return NextResponse.json({ success: false, error: "Template tidak ditemukan" }, { status: 400 });
    }
    const twilioRes = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toNumber}`,
      contentSid: template.sid,
    });
    // Simpan ChatMessage outbound dengan isi template
    const chatMsg = await ChatMessage.create({
      lead: lead._id,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: template.body,
      direction: "outbound",
      status: "sent",
      twilioSid: twilioRes.sid,
      mediaUrls: [],
      mediaTypes: [],
      isTemplate: true,
    });
    return NextResponse.json({ success: true, sid: twilioRes.sid, chatMsg });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
