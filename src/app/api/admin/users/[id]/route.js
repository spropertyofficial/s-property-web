import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyAdminWithRole } from "@/lib/auth";

function genAgentCode() {
  return "AGT" + Date.now().toString().slice(-6);
}

// PATCH /api/admin/users/[id] - update user (superadmin, editor)
export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAdminWithRole(req, ["superadmin", "editor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = params;
    const body = await req.json();
    const allowed = ["name", "phone", "type", "isActive"];
    const updates = {};
    for (const k of allowed) if (k in body) updates[k] = body[k];

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    const prevType = user.type;
    for (const [k, v] of Object.entries(updates)) {
      user[k] = v;
    }

    // Ensure agentCode when converting to agent
    if (prevType !== "agent" && user.type === "agent" && !user.agentCode) {
      user.agentCode = genAgentCode();
    }

    await user.save();
    const plain = user.toObject();
    delete plain.password;
    return NextResponse.json({ success: true, item: plain });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui user" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - delete user (superadmin only)
export async function DELETE(req, { params }) {
  try {
    const auth = await verifyAdminWithRole(req, ["superadmin"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = params;
    const res = await User.findByIdAndDelete(id);
    if (!res) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus user" }, { status: 500 });
  }
}
