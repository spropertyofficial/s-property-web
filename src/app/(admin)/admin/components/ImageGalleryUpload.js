"use client";
import { useRef, useState } from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Swal from "sweetalert2";
import { handleImageUpload as uploadImage } from "@/utils/handleImagesUpload";

export default function ImageGalleryUpload({
  // Props yang masih perlu dari parent (data dan setter)
  previewImages,
  setPreviewImages,
  form,
  setForm,
  
  // Props konfigurasi
  maxImages = 10,
  assetType = "lainnya",
  propertyName = "",
  clusterName = null,
  unitType = null,
  uploadType = "property",
  title = "Galeri Gambar",
  description = "Format yang didukung: JPG, PNG, WebP. Maksimal Ukuran: 10MB.",
  aspectRatio = "aspect-video",
  gridCols = "grid-cols-2 md:grid-cols-4",
  required = false,
  
  // Props untuk disable dari parent
  isSubmitting = false,
}) {
  const fileInputRef = useRef(null);
  
  // State internal komponen - tidak perlu dilempar dari parent
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e) => {
    setIsUploading(true);
    
    uploadImage(e, {
      previewImages,
      setPreviewImages,
      form,
      setForm,
      maxImages,
      assetType,
      propertyName,
      clusterName,
      unitType,
      uploadType,
      setUploadProgress,
    }).finally(() => {
      setIsUploading(false);
      setUploadProgress(0);
    });
  };

  const removeImage = async (index) => {
    try {
      const imageToRemove = previewImages[index];

      if (imageToRemove.publicId) {
        const deleteResponse = await fetch("/api/upload/", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: imageToRemove.publicId,
          }),
        });

        const deleteResult = await deleteResponse.json();
        if (!deleteResponse.ok && !deleteResult.warning) {
          throw new Error(
            deleteResult.error || "Gagal menghapus gambar dari server"
          );
        }
      }

      setPreviewImages((prev) => {
        const newPreviewImages = [...prev];
        if (newPreviewImages[index].url?.startsWith("blob:")) {
          URL.revokeObjectURL(newPreviewImages[index].url);
        }
        newPreviewImages.splice(index, 1);
        return newPreviewImages;
      });

      setForm((prev) => {
        const newGallery = [...(prev.gallery || [])];
        newGallery.splice(index, 1);
        return { ...prev, gallery: newGallery };
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus gambar. " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <fieldset className="border p-6 rounded-md shadow-sm">
      <legend className="text-lg font-semibold px-2">
        {title} {required && <span className="text-red-500">*</span>}
      </legend>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Mengupload gambar... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Upload Button */}
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
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
          {isUploading 
            ? "Sedang Mengupload..." 
            : previewImages.length >= maxImages 
            ? `Maksimal ${maxImages} gambar`
            : "Pilih Gambar"
          }
        </button>
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      </div>

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div className={`grid ${gridCols} gap-4 mt-4`}>
          {previewImages.map((image, index) => (
            <div key={index} className="relative group">
              <div
                className={`${aspectRatio} bg-gray-100 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                  image.error
                    ? "border-red-500 bg-red-50"
                    : image.uploaded
                    ? "border-green-500 bg-green-50"
                    : "border-yellow-500 bg-yellow-50"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.name || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                
                {/* Status Badge */}
                {image.uploaded && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Terupload
                  </div>
                )}
                {image.error && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Gagal
                  </div>
                )}
                {!image.uploaded && !image.error && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Uploading...
                  </div>
                )}

                {/* Upload Type Badge */}
                {uploadType !== "property" && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
                    {uploadType}
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="Hapus gambar"
                disabled={isUploading}
              >
                <FaTrash size={12} />
              </button>

              {/* Image Info */}
              <div className="mt-1">
                <p className="text-xs text-gray-500 truncate" title={image.name}>
                  {image.name || `Image ${index + 1}`}
                </p>
                {image.size && (
                  <p className="text-xs text-gray-400">
                    {(image.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {previewImages.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <div className="text-gray-400 mb-2">
            <FaUpload className="mx-auto text-2xl mb-2" />
            <p>Belum ada gambar yang diunggah</p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            disabled={isSubmitting || isUploading}
          >
            Klik untuk upload gambar
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>
          {previewImages.length} / {maxImages} gambar
        </span>
        {uploadType !== "property" && (
          <span className="capitalize">
            Mode: {uploadType}
          </span>
        )}
      </div>
    </fieldset>
  );
}