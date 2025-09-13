import dbConnect from "@/lib/mongodb";
import ChatMessage from "@/lib/models/ChatMessage";

export async function POST(req) {
  await dbConnect();
  const { leadId } = await req.json();
  if (!leadId) return Response.json({ success: false, error: "leadId required" }, { status: 400 });
  // Update all inbound messages for this lead to status 'read'
  const result = await ChatMessage.updateMany({ lead: leadId, direction: "inbound", status: "received" }, { $set: { status: "read" } });
  console.log(`[READ] leadId: ${leadId}, modified: ${result.modifiedCount}`);
  return Response.json({ success: true, modified: result.modifiedCount });
}
