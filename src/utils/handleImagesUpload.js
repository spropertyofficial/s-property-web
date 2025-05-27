import Swal from "sweetalert2";

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

  const newGalleryItems = [];
  const newPreviewImages = [];

  try {
    // Set initial progress
    if (setUploadProgress) setUploadProgress(5);

    const residentialId = residentialName
      ? residentialName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : "general";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update progress
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

    // Complete progress
    if (setUploadProgress) {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }

    // Update state
    setPreviewImages((prev) => [...prev, ...newPreviewImages]);
    setForm((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...newGalleryItems],
    }));

    // Success callback atau default notification
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
