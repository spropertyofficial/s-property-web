// util/handleImageUpload.js

import Swal from "sweetalert2";

const MAX_FILE_SIZE_MB = 10; 
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const handleImageUpload = async (
  e,
  {
    previewImages,
    setPreviewImages,
    form,
    setForm,
    maxImages = 10,
    residentialName = "general",
    setUploadProgress = null,
  }
) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // Validasi jumlah & ukuran (tetap penting)
  if (previewImages.length + files.length > maxImages) {
    Swal.fire("Peringatan", `Maksimal ${maxImages} gambar.`, "warning");
    return;
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire(
        "Ukuran File Terlalu Besar",
        `File "${file.name}" melebihi batas ${MAX_FILE_SIZE_MB} MB.`,
        "error"
      );
      e.target.value = null;
      return;
    }
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      Swal.fire({
        title: "Ukuran File Terlalu Besar",
        text: `File "${file.name}" melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB. Silakan pilih file lain.`,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
      e.target.value = null;
      return; 
    }
  }
  // <-- AKHIR MODIFIKASI

  const newGalleryItems = [];
  const newPreviewImages = [];
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!CLOUD_NAME || !API_KEY) {
    console.error("Cloudinary env variables not set!");
    Swal.fire(
      "Error Konfigurasi",
      "Konfigurasi Cloudinary tidak ditemukan.",
      "error"
    );
    return;
  }

  try {
    if (setUploadProgress) setUploadProgress(5);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = `s-property/residential/${residentialName
        .toLowerCase()
        .replace(/\s+/g, "-")}`;
      const paramsToSign = { timestamp, folder };

      const signRes = await fetch("/api/sign-cloudinary-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paramsToSign }),
      });
      const signData = await signRes.json();
      if (!signRes.ok)
        throw new Error(signData.error || "Gagal mendapatkan signature");
      const { signature } = signData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);
      if (setUploadProgress) {
        const progressPerFile = 90 / files.length;
        setUploadProgress(5 + progressPerFile * i);
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const uploadRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok)
        throw new Error(
          uploadData.error?.message || "Upload ke Cloudinary gagal"
        );

      newGalleryItems.push({
        src: uploadData.secure_url,
        alt: file.name,
        type: "property",
        publicId: uploadData.public_id,
      });
      newPreviewImages.push({
        url: uploadData.secure_url,
        name: file.name,
        size: file.size,
        publicId: uploadData.public_id,
      });
    }

    if (setUploadProgress) {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }

    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
    setForm((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...newGalleryItems],
    }));

    Swal.fire(
      "Berhasil!",
      `${files.length} gambar berhasil diunggah`,
      "success",
      { timer: 1500, showConfirmButton: false }
    );
  } catch (error) {
    console.error("Direct upload error:", error);
    Swal.fire("Error", error.message || "Gagal mengunggah gambar", "error");
    if (setUploadProgress) setUploadProgress(0);
  }
};