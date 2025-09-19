import dbConnect from "@/lib/mongodb";

import ChatMessage from "@/lib/models/ChatMessage";

import mongoose from "mongoose";
export async function GET(req) {
  await dbConnect();
  const leadId = req.nextUrl.searchParams.get("leadId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
  const before = req.nextUrl.searchParams.get("before"); // messageId (ObjectId)
  if (!leadId)
    return Response.json({ error: "leadId required" }, { status: 400 });
  // Log debug
  console.log(
    "[API/messages] leadId:",
    leadId,
    "limit:",
    limit,
    "before:",
    before
  );
  // Query: pesan untuk leadId, urut terbaru ke terlama
  // Log leadId persis sebelum konversi
  console.log(
    "[API/messages] raw leadId:",
    JSON.stringify(leadId),
    "length:",
    leadId?.length
  );
  let leadObjId;
  try {
    leadObjId = new mongoose.Types.ObjectId(leadId);
  } catch (err) {
    console.error("[API/messages] ObjectId error:", err);
    return Response.json(
      { error: "leadId invalid ObjectId", detail: err.message, leadId },
      { status: 400 }
    );
  }
  const query = { lead: leadObjId };
  if (before) {
    // Pagination dengan _id (ObjectId)
    try {
      query._id = { $lt: new mongoose.Types.ObjectId(before) };
    } catch (err) {
      return Response.json({ error: "before invalid ObjectId", detail: err.message, before }, { status: 400 });
    }
  }
  const messages = await ChatMessage.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .lean();
  console.log("[API/messages] found messages:", messages.length);
  // Kembalikan urutan lama ke baru (untuk chat window)
  messages.reverse();
  return Response.json({ messages });
}
