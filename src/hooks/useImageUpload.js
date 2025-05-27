import { useState } from "react";
import Swal from "sweetalert2";

export const useImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files, residentialName, onSuccess, onError) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const newGalleryItems = [];
    const newPreviewImages = [];

    try {
      // Inisialisasi progress
      setUploadProgress(5);

      // Ambil nama residential untuk folder
      const residentialId = residentialName
        ? residentialName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : "general";

      // Proses upload untuk setiap file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("residential", residentialId);
          formData.append("category", "residential");

          // Update progress
          const progressPerFile = 90 / files.length;
          setUploadProgress(5 + progressPerFile * i);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (res.ok) {
            newGalleryItems.push({
              src: data.url,
              alt: file.name,
              type: "property",
              publicId: data.publicId,
            });

            newPreviewImages.push({
              url: data.url,
              name: file.name,
              size: file.size,
              publicId: data.publicId,
            });
          } else {
            throw new Error(
              data.error || `Upload gagal untuk file: ${file.name}`
            );
          }
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          // Lanjutkan dengan file berikutnya, tapi catat error
          if (onError) {
            onError(
              new Error(`Gagal upload ${file.name}: ${fileError.message}`)
            );
          }
        }
      }

      // Update progress
      setUploadProgress(100);

      // Callback success (bahkan jika ada beberapa file yang gagal)
      if (
        onSuccess &&
        (newGalleryItems.length > 0 || newPreviewImages.length > 0)
      ) {
        onSuccess(newGalleryItems, newPreviewImages);
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error("General upload error:", error);

      if (onError) {
        onError(error);
      } else {
        Swal.fire({
          title: "Error",
          text: "Terjadi kesalahan saat mengunggah gambar",
          icon: "error",
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImages,
    uploadProgress,
    isUploading,
  };
};
