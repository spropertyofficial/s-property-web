"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Swal from "sweetalert2";

// Staged item shape:
// - existing: { kind: "existing", url, publicId, size?, mimeType?, width?, height? }
// - new: { kind: "new", file: File, name, size, mimeType }

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const DeferredImageGalleryUpload = forwardRef(function DeferredImageGalleryUpload(
  {
    stagedItems,
    setStagedItems,
    previewImages,
    setPreviewImages,
    maxImages = 10,
  uploadType = "activity",
  // folder context (for non-activity uploads)
  assetType = "lainnya",
  propertyName = "",
  clusterName = null,
  unitType = null,
  // optional override to fully customize folder path
  buildFolder,
    title = "Galeri Gambar (Unggah saat Kirim)",
    description = "Format didukung: JPG, PNG, WebP. Maks 10MB. Gambar akan diunggah saat Anda mengirim formulir.",
    aspectRatio = "aspect-video",
    gridCols = "grid-cols-2 md:grid-cols-4",
    required = false,
    isSubmitting = false,
  },
  ref
) {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const slugify = (text) => {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const computeFolder = () => {
    if (typeof buildFolder === "function") {
      return buildFolder({ uploadType, assetType, propertyName, clusterName, unitType });
    }

    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");

    if (uploadType === "activity") {
      return `s-property/activity-logs/${yyyy}/${mm}`;
    }

    const assetTypeSlug = slugify(assetType);
    const propertyNameSlug = slugify(propertyName);

    if (["property"].includes(uploadType)) {
      return `s-property/${assetTypeSlug}/${propertyNameSlug}`;
    }
    if (uploadType === "cluster") {
      if (assetTypeSlug === "perumahan" && clusterName) {
        const clusterSlug = slugify(clusterName);
        return `s-property/${assetTypeSlug}/${propertyNameSlug}/clusters/${clusterSlug}`;
      }
      throw new Error("Cluster hanya untuk perumahan dan nama cluster wajib.");
    }
    if (uploadType === "unit") {
      if (!unitType) throw new Error("Nama tipe unit harus diisi.");
      const unitTypeSlug = slugify(unitType);
      if (assetTypeSlug === "perumahan" && clusterName) {
        const clusterSlug = slugify(clusterName);
        return `s-property/${assetTypeSlug}/${propertyNameSlug}/clusters/${clusterSlug}/units/${unitTypeSlug}`;
      }
      if (["ruko", "apartemen"].includes(assetTypeSlug)) {
        return `s-property/${assetTypeSlug}/${propertyNameSlug}/units/${unitTypeSlug}`;
      }
      throw new Error("Tipe unit tidak sesuai dengan asset type.");
    }
    if (uploadType === "region" || uploadType === "city") {
      return `s-property/explore-cities/${uploadType}s`;
    }
    throw new Error("Tipe upload tidak valid.");
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Count check
    if (previewImages.length + files.length > maxImages) {
      Swal.fire("Peringatan", `Maksimal ${maxImages} gambar.`, "warning");
      e.target.value = null;
      return;
    }

    const nextPreview = [];
    const nextStaged = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        Swal.fire({
          title: "Ukuran File Terlalu Besar",
          text: `File "${file.name}" melebihi ${MAX_FILE_SIZE_MB} MB.`,
          icon: "error",
          confirmButtonText: "OK",
        });
        continue;
      }
      const objectUrl = URL.createObjectURL(file);
      nextPreview.push({
        url: objectUrl,
        name: file.name,
        size: file.size,
        uploaded: false,
        uploadType,
        _localObjectUrl: true,
      });
      nextStaged.push({
        kind: "new",
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      });
    }
    if (nextPreview.length) {
      setPreviewImages((prev) => [...prev, ...nextPreview]);
      setStagedItems((prev) => [...prev, ...nextStaged]);
    }
    e.target.value = null;
  };

  const removeImage = (index) => {
    // Do not delete from Cloudinary here; only stage removal
    setPreviewImages((prev) => {
      const arr = [...prev];
      const item = arr[index];
      if (item?._localObjectUrl && item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      arr.splice(index, 1);
      return arr;
    });
    setStagedItems((prev) => {
      const arr = [...prev];
      arr.splice(index, 1);
      return arr;
    });
  };

  // Expose uploadAll to parent
  useImperativeHandle(ref, () => ({
    uploadAll: async () => {
      // Returns attachments array [{url, publicId, size, mimeType, width, height}]
      if (!stagedItems || stagedItems.length === 0) return [];

      const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      if (!CLOUD_NAME || !API_KEY) {
        throw new Error("Konfigurasi Cloudinary tidak ditemukan");
      }

  // Build folder for uploads (based on props)
  const folder = computeFolder();

      const existing = stagedItems.filter((s) => s.kind === "existing");
      const news = stagedItems.filter((s) => s.kind === "new");

      const attachments = existing.map((e) => ({
        url: e.url,
        publicId: e.publicId,
        size: e.size,
        mimeType: e.mimeType,
        width: e.width,
        height: e.height,
      }));

      if (news.length === 0) {
        return attachments;
      }

      try {
        setIsUploading(true);
        setUploadProgress(5);

        // Get signature once
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign = { timestamp, folder };
        const signRes = await fetch("/api/sign-cloudinary-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paramsToSign }),
        });
        const signData = await signRes.json();
        if (!signRes.ok) throw new Error(signData.error || "Gagal mendapatkan signature");
        const { signature } = signData;

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        let completed = 0;
        const total = news.length;

        const uploaded = [];
        for (let i = 0; i < news.length; i++) {
          const { file } = news[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", API_KEY);
          formData.append("timestamp", timestamp);
          formData.append("signature", signature);
          formData.append("folder", folder);

          const res = await fetch(cloudinaryUrl, { method: "POST", body: formData });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data?.error?.message || `Upload gagal untuk ${file.name}`);
          }
          uploaded.push({
            url: data.secure_url,
            publicId: data.public_id,
            size: file.size,
            mimeType: file.type,
            width: data.width,
            height: data.height,
          });

          completed += 1;
          setUploadProgress(5 + Math.round((completed / total) * 95));
        }

        const result = [...attachments, ...uploaded];

        // Mark previews uploaded
        setPreviewImages((prev) => prev.map((p, idx) => ({ ...p, uploaded: true })));
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 800);
        return result;
      } finally {
        setIsUploading(false);
      }
    },
  }));

  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">
        {title} {required && <span className="text-red-500">*</span>}
      </legend>

      {uploadProgress > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isUploading ? `Mengupload gambar... ${uploadProgress}%` : `Progres ${uploadProgress}%`}
          </p>
        </div>
      )}

      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isUploading || previewImages.length >= maxImages}
        >
          <FaUpload className="mr-2" />
          {previewImages.length >= maxImages ? `Maksimal ${maxImages} gambar` : "Pilih Gambar"}
        </button>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>

      {previewImages.length > 0 ? (
        <div className={`grid ${gridCols} gap-4 mt-4`}>
          {previewImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className={`${aspectRatio} bg-gray-100 rounded-md overflow-hidden border-2 transition-all duration-200 ${image.uploaded ? "border-green-500 bg-green-50" : "border-gray-300"}`}>
                <Image src={image.url} alt={image.name || `Image ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                {image.uploaded && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">Terupload</div>
                )}
                {!image.uploaded && (
                  <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">Belum diunggah</div>
                )}
                {uploadType !== "property" && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">{uploadType}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="Hapus gambar"
                disabled={isUploading}
              >
                <FaTrash size={12} />
              </button>
              <div className="mt-1">
                <p className="text-xs text-gray-500 truncate" title={image.name}>{image.name || `Image ${index + 1}`}</p>
                {image.size && <p className="text-xs text-gray-400">{(image.size / 1024 / 1024).toFixed(2)} MB</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <div className="text-gray-400 mb-2">
            <FaUpload className="mx-auto text-2xl mb-2" />
            <p>Belum ada gambar yang dipilih</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={isSubmitting || isUploading}
          >
            Klik untuk pilih gambar
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>
          {previewImages.length} / {maxImages} gambar
        </span>
        {uploadType !== "property" && <span className="capitalize">Mode: {uploadType}</span>}
      </div>
    </fieldset>
  );
});

export default DeferredImageGalleryUpload;
