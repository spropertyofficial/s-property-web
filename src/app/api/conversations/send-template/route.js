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
  const { contact, leadId, propertyName, templateKey } = body;
  if (!contact || !propertyName || (!message && !mediaFile)) {
    return Response.json(
      { error: "contact, propertyName, dan pesan/media wajib diisi" },
      { status: 400 }
    );
  }
  // Cari nomor WhatsApp dari Project
  const project = await Project.findOne({ name: propertyName });
  if (!project || !project.whatsappNumber) {
    return Response.json(
      { error: "Project atau nomor WhatsApp tidak ditemukan" },
      { status: 404 }
    );
  }
  try {
    const toNumber = contact;
    const fromNumber = `whatsapp:${project.whatsappNumber}`;
    const template = TEMPLATE_MAP[templateKey];
    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template tidak ditemukan" },
        { status: 400 }
      );
    }
    const twilioRes = await twilioClient.messages.create({
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      contentSid: template.sid,
    });
    // Simpan ChatMessage outbound dengan isi template
    const chatMsg = await ChatMessage.create({
      lead: leadId,
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
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
