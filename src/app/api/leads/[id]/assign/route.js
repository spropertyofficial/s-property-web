import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AgentQueue from "@/lib/models/AgentQueue";
import User from "@/lib/models/User";

// Endpoint untuk agent claim lead
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const { agentId } = await req.json(); // agentId dikirim dari frontend (harus sudah login)
  if (!agentId) {
    return NextResponse.json({ success: false, error: "agentId wajib diisi" }, { status: 400 });
  }

  // Validasi: lead harus belum di-assign
  const lead = await Lead.findById(id);
  if (!lead) return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
  if (lead.agent) return NextResponse.json({ success: false, error: "Lead sudah di-assign" }, { status: 400 });

  // Validasi: agentId harus agent yang dapat giliran
  const queue = await AgentQueue.findOne({});
  if (!queue || !queue.agents || queue.agents.length === 0)
    return NextResponse.json({ success: false, error: "Queue agent kosong" }, { status: 400 });
  const activeAgents = queue.agents.filter(a => a.active);
  const nextIndex = queue.lastAssignedIndex;
  const expectedAgent = activeAgents[nextIndex]?.user?.toString();
  if (agentId !== expectedAgent)
    return NextResponse.json({ success: false, error: "Bukan giliran agent ini" }, { status: 403 });

  // Assign lead ke agent dan catat waktu
  lead.agent = agentId;
  lead.assignedAt = Date.now();
  await lead.save();

  return NextResponse.json({ success: true, lead });
}
