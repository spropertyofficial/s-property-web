import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import AgentQueue from "@/lib/models/AgentQueue";

// GET: Ambil semua proyek
export async function GET() {
  await dbConnect();
  const projects = await Project.find({}).populate("agentQueue");
  return NextResponse.json({ projects });
}

// POST: Tambah atau update proyek
export async function POST(req) {
  await dbConnect();
  const { name, whatsappNumber, agentQueue, description, _id } = await req.json();
  let project;
  if (_id) {
    project = await Project.findById(_id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    project.name = name;
    project.whatsappNumber = whatsappNumber;
    project.agentQueue = agentQueue;
    project.description = description;
    project.updatedAt = Date.now();
    await project.save();
  } else {
    project = await Project.create({ name, whatsappNumber, agentQueue, description });
  }
  return NextResponse.json({ success: true, project });
}
