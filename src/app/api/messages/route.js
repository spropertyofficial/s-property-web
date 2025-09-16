import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";

export async function GET(req) {
  await dbConnect();
  const leadId = req.nextUrl.searchParams.get("leadId");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
  const before = req.nextUrl.searchParams.get("before"); // timestamp or messageId
  if (!leadId) return Response.json({ error: "leadId required" }, { status: 400 });

  // Query: pesan untuk leadId, urut terbaru ke terlama
  const query = { lead: leadId };
  if (before) {
    // Jika before berupa timestamp
    query.sentAt = { $lt: new Date(before) };
  }
  const messages = await ChatMessage.find(query)
    .sort({ sentAt: -1 })
    .limit(limit)
    .lean();

  // Kembalikan urutan lama ke baru (untuk chat window)
  messages.reverse();
  return Response.json({ messages });
}
