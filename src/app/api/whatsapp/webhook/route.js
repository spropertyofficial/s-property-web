import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    // Twilio webhook payload
    const {
      From, // nomor pengirim (format: whatsapp:+62xxxx)
      To,   // nomor penerima (format: whatsapp:+62xxxx)
      Body, // isi pesan
      MessageSid, // ID pesan Twilio
      Timestamp, // waktu pesan (opsional)
    } = body;

    if (!From || !Body) {
      return NextResponse.json({ success: false, error: "Payload tidak valid" }, { status: 400 });
    }

    // Cari lead berdasarkan nomor pengirim
    let lead = await Lead.findOne({ contact: From.replace("whatsapp:", "") });
    if (!lead) {
      // Buat lead baru jika belum ada
      lead = await Lead.create({
        name: "Prospek WhatsApp",
        contact: From.replace("whatsapp:", ""),
        source: "WhatsApp",
        status: "Baru",
        agent: null, // assignment akan diatur di milestone berikutnya
      });
    }

    // Simpan pesan ke ChatMessage
    await ChatMessage.create({
      lead: lead._id,
      from: From,
      to: To,
      body: Body,
      direction: "inbound",
      status: "received",
      sentAt: Timestamp ? new Date(Timestamp) : Date.now(),
      twilioSid: MessageSid,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
