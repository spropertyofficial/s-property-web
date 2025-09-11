import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import ChatMessage from "@/lib/models/ChatMessage";
import querystring from "querystring";

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
  if (!From || !Body) {
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

  console.log("Pesan berhasil disimpan untuk lead:", lead.contact);
  return NextResponse.json({ success: true });
}
