// /app/api/residential/[id]/route.js
import connectDB from "@/lib/mongodb";
import Residential from "@/lib/models/Residential";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const property = await Residential.findById(id).lean();

    if (!property) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data properti" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();

  try {
    const updated = await Residential.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Properti berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal memperbarui properti" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Residential.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Properti tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Properti berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { message: "Gagal menghapus properti" },
      { status: 500 }
    );
  }
}
