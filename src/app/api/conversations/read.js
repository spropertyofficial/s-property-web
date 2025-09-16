import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(req) {
  await dbConnect();
  const { leadId } = await req.json();
  if (!leadId) return Response.json({ success: false, error: "leadId required" }, { status: 400 });
  // Update all inbound messages for this lead to status 'read'
  await ChatMessage.updateMany({ lead: leadId, direction: "inbound", status: "received" }, { $set: { status: "read" } });
  return Response.json({ success: true });
}
