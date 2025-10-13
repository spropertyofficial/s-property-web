
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/lib/models/Project";
// DELETE: Hapus proyek berdasarkan ID
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  await Project.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}