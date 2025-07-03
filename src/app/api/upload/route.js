import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus semua karakter non-word
    .replace(/\-\-+/g, "-") // Ganti -- ganda dengan -
    .replace(/^-+/, "") // Pangkas - dari depan
    .replace(/-+$/, ""); // Pangkas - dari belakang
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 1. Ambil semua parameter yang mungkin dari frontend
  const assetType = slugify(formData.get("assetType") || "lainnya"); // e.g., 'perumahan', 'ruko', 'tanah'
  const propertyName = slugify(formData.get("propertyName") || "general"); // Dulu 'residential'
  const clusterName = slugify(formData.get("clusterName") || "");
  const unitType = slugify(formData.get("unitType") || "");

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // 2. Buat path folder secara bertahap
    let folderPath = `s-property/${assetType}/${propertyName}`;

    if (clusterName) {
      folderPath += `/cluster/${clusterName}`;
      // Hanya tambahkan unit jika ada cluster
      if (unitType) {
        folderPath += `/unit/${unitType}`;
      }
    }

    console.log(`Uploading to Cloudinary folder: ${folderPath}`);

    // Logika upload_stream Anda tetap sama (sudah benar)
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: folderPath }, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        })
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

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID atau URL diperlukan" },
        { status: 400 }
      );
    }

    let result;

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
