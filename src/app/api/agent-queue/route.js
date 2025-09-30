import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AgentQueue from "@/lib/models/AgentQueue";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";

// GET: Ambil agent queue per proyek
export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const filter = projectId ? { projectId } : {};
  const queue = await AgentQueue.findOne(filter);
  if (!queue) return NextResponse.json({ agents: [], lastAssignedIndex: -1, escalationMinutes: 5 });
  await queue.populate("agents.user");
  return NextResponse.json({ agents: queue.agents, lastAssignedIndex: queue.lastAssignedIndex, escalationMinutes: queue.escalationMinutes ?? 5 });
}

// POST: Update agent queue per proyek
export async function POST(req) {
  await dbConnect();
  const { agents, lastAssignedIndex, escalationMinutes, projectId, _id } = await req.json();
  let queue;
  if (_id) {
    queue = await AgentQueue.findById(_id);
    if (!queue) return NextResponse.json({ error: "AgentQueue not found" }, { status: 404 });
    queue.agents = agents;
    if (typeof lastAssignedIndex === "number") queue.lastAssignedIndex = lastAssignedIndex;
    if (typeof escalationMinutes === "number") queue.escalationMinutes = escalationMinutes;
    if (projectId) queue.projectId = projectId;
    queue.updatedAt = Date.now();
    await queue.save();
  } else {
    queue = await AgentQueue.create({ agents, lastAssignedIndex: lastAssignedIndex ?? -1, escalationMinutes: escalationMinutes ?? 5, projectId });
  }
  // Update Project.agentQueue agar selalu terisi
  if (queue.projectId) {
    await Project.findByIdAndUpdate(queue.projectId, { agentQueue: queue._id });
  }
  await queue.populate("agents.user");
  return NextResponse.json({ success: true, agents: queue.agents, lastAssignedIndex: queue.lastAssignedIndex, escalationMinutes: queue.escalationMinutes ?? 5, projectId: queue.projectId });
}
