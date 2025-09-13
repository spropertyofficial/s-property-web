import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AgentQueue from "@/lib/models/AgentQueue";
import User from "@/lib/models/User";

// GET: Ambil agent queue
export async function GET() {
  await dbConnect();
  const queue = await AgentQueue.findOne({});
  if (!queue) return NextResponse.json({ agents: [], lastAssignedIndex: -1, escalationMinutes: 10 });
  // Populate user info
  await queue.populate("agents.user");
  return NextResponse.json({ agents: queue.agents, lastAssignedIndex: queue.lastAssignedIndex, escalationMinutes: queue.escalationMinutes ?? 10 });
}

// POST: Update agent queue (add, remove, reorder, set active)
export async function POST(req) {
  await dbConnect();
  const { agents, lastAssignedIndex, escalationMinutes } = await req.json();
  // agents: [{ user: userId, order: number, active: bool }]
  let queue = await AgentQueue.findOne({});
  if (!queue) {
    queue = await AgentQueue.create({ agents, lastAssignedIndex: lastAssignedIndex ?? -1, escalationMinutes: escalationMinutes ?? 10 });
  } else {
    queue.agents = agents;
    if (typeof lastAssignedIndex === "number") queue.lastAssignedIndex = lastAssignedIndex;
    if (typeof escalationMinutes === "number") queue.escalationMinutes = escalationMinutes;
    queue.updatedAt = Date.now();
    await queue.save();
  }
  await queue.populate("agents.user");
  return NextResponse.json({ success: true, agents: queue.agents, lastAssignedIndex: queue.lastAssignedIndex, escalationMinutes: queue.escalationMinutes ?? 10 });
}
