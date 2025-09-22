import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/lib/models/Lead";
import AgentQueue from "@/lib/models/AgentQueue";
import User from "@/lib/models/User";

// Endpoint untuk agent claim lead
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = await params;
  const { agentId } = await req.json();
  if (!agentId) {
    return NextResponse.json({ success: false, error: "agentId kosong" }, { status: 400 });
  }

  // Validasi: lead harus belum di-assign
  const lead = await Lead.findById(id);
  if (!lead) return NextResponse.json({ success: false, error: "Lead tidak ditemukan" }, { status: 404 });
  // Logika baru: cek apakah lead sudah diklaim
  if (lead.isClaimed) return NextResponse.json({ success: false, error: "Lead sudah diklaim" }, { status: 400 });

  // Validasi: agentId harus agent yang dapat giliran
  const queue = await AgentQueue.findOne({});
  if (!queue || !queue.agents || queue.agents.length === 0)
    return NextResponse.json({ success: false, error: "Queue agent kosong" }, { status: 400 });
  const activeAgents = queue.agents.filter(a => a.active);
  const nextIndex = queue.lastAssignedIndex;
  const expectedAgent = activeAgents[nextIndex]?.user?.toString();
  // if (agentId !== expectedAgent)
  //   return NextResponse.json({ success: false, error: "Bukan giliran agent ini" }, { status: 403 });

  // Assign lead ke agent, catat waktu, dan tandai sudah diklaim
  lead.agent = agentId;
  lead.isClaimed = true;
  await lead.save();

  return NextResponse.json({ success: true, lead });
}
