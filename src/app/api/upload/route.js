import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  // Parameter untuk struktur folder
  const residential = formData.get("residential") || "general";
  const category = formData.get("category") || "residential"; // residential, cluster, unit
  const cluster = formData.get("cluster") || "";
  const unitType = formData.get("unitType") || "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // Buat path folder berdasarkan parameter
    let folderPath = `s-property/residential/${residential
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    // Tambahkan subpath berdasarkan kategori
    if (category === "cluster" && cluster) {
      folderPath += `/cluster/${cluster.toLowerCase().replace(/\s+/g, "-")}`;
    } else if (category === "unit" && cluster && unitType) {
      folderPath += `/cluster/${cluster
        .toLowerCase()
        .replace(/\s+/g, "-")}/unit/${unitType
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
    }

    console.log(`Uploading to Cloudinary folder: ${folderPath}`);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folderPath,
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { publicId } = await req.json();
    console.log("Received DELETE request:", { publicId });

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID atau URL diperlukan" },
        { status: 400 }
      );
    }

    let result;

    // Jika publicId tersedia, gunakan itu
    result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return NextResponse.json({ success: true });
    } else {
      // Jika gambar tidak ditemukan, tetap anggap berhasil untuk frontend
      if (result.result === "not found") {
        console.log(
          "Image not found in Cloudinary, but continuing with frontend deletion"
        );
        return NextResponse.json({
          success: true,
          warning: "Image not found in Cloudinary, but deleted from frontend",
        });
      }

      return NextResponse.json(
        { error: "Gagal menghapus gambar", details: result },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus gambar" },
      { status: 500 }
    );
  }
}
