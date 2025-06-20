import Swal from "sweetalert2";

const MAX_FILE_SIZE_MB = 8;
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
    onSuccess = null,
    onError = null,
  }
) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  if (previewImages.length + files.length > maxImages) {
    Swal.fire({
      title: "Peringatan",
      text: `Maksimal ${maxImages} gambar yang dapat diunggah`,
      icon: "warning",
      confirmButtonText: "OK",
      confirmButtonColor: "#131414",
    });
    return;
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

  try {
    if (setUploadProgress) setUploadProgress(5);

    const residentialId = residentialName
      ? residentialName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : "general";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (setUploadProgress) {
        const progressPerFile = 90 / files.length;
        setUploadProgress(5 + progressPerFile * i);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("residential", residentialId);
      formData.append("category", "residential");

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
        throw new Error(data.error || `Upload gagal untuk file: ${file.name}`);
      }
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

    if (onSuccess) {
      onSuccess(newGalleryItems, newPreviewImages);
    } else {
      Swal.fire({
        title: "Berhasil!",
        text: `${files.length} gambar berhasil diunggah`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);

    if (onError) {
      onError(error);
    } else {
      Swal.fire({
        title: "Error",
        text: error.message || "Gagal mengunggah gambar",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
    }
  }
};