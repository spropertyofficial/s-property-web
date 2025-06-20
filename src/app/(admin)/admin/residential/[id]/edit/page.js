"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { FaTrash, FaUpload, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { toCapitalCase } from "@/utils/toCapitalcase";

export default function EditResidentialPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    startPrice: "",
    developer: "",
    propertyStatus: "SALE",
    location: {
      region: "",
      city: "",
      area: "",
      address: "",
      country: "Indonesia",
      mapsLink: "",
    },
    gallery: [],
    clusters: [],
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ambil data properti saat halaman dimuat
  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(`/api/residential/${id}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal mengambil data properti");
        }

        const data = await res.json();

        if (!data) {
          throw new Error("Data properti tidak ditemukan");
        }

        // Set form data dari properti yang diterima
        setForm(data);

        // Set preview images dari gallery
        if (data.gallery && data.gallery.length > 0) {
          setPreviewImages(
            data.gallery.map((img) => ({
              url: img.src,
              name: img.alt || "",
              size: 0,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        Swal.fire({
          title: "Error",
          text: err.message || "Terjadi kesalahan saat mengambil data",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#131414",
        }).then(() => {
          router.push("/admin/residential");
        });
      }
    }

    if (id) {
      fetchProperty();
    }
  }, [id, router]);

  // Validasi form
  const validateForm = () => {
    const newErrors = {};

    // Validasi field wajib
    if (!form.name?.trim()) newErrors.name = "Nama properti wajib diisi";
    if (!form.startPrice) newErrors.startPrice = "Harga awal wajib diisi";
    if (!form.developer?.trim())
      newErrors.developer = "Nama developer wajib diisi";

    // Validasi lokasi
    if (!form.location?.city?.trim())
      newErrors["location.city"] = "Kota wajib diisi";
    if (!form.location?.area?.trim())
      newErrors["location.area"] = "Area wajib diisi";

    // Validasi harga (harus angka positif)
    if (
      form.startPrice &&
      (isNaN(form.startPrice) || Number(form.startPrice) <= 0)
    ) {
      newErrors.startPrice = "Harga harus berupa angka positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle perubahan nilai input
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Hapus error saat field diubah
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle upload gambar
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (previewImages.length + files.length > 10) {
      Swal.fire({
        title: "Peringatan",
        text: "Maksimal 10 gambar yang dapat diunggah",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
      return;
    }

    setIsSubmitting(true);
    const newGalleryItems = [];
    const newPreviewImages = [];

    // Inisialisasi progress
    setUploadProgress(5);

    try {
      // Ambil nama residential untuk folder
      const residentialName = form.name
        ? form.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
        : "general";

      // Proses upload untuk setiap file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("residential", residentialName);
        formData.append("category", "residential"); // Ini adalah gambar untuk residential

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
          throw new Error(data.error || "Upload gagal");
        }
      }

      // Update state
      setUploadProgress(100);
      setPreviewImages((prev) => [...prev, ...newPreviewImages]);
      setForm((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...newGalleryItems],
      }));

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Error",
        text: "Terjadi kesalahan saat mengunggah gambar",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus gambar
  const removeImage = async (index) => {
    try {
      // Ambil informasi gambar yang akan dihapus
      const imageToDelete = form.gallery[index];
      console.log("Image to delete:", imageToDelete);

      // Jika gambar memiliki publicId langsung, gunakan itu
      if (imageToDelete && imageToDelete.publicId) {
        console.log("Using stored publicId:", imageToDelete.publicId);

        const deleteResponse = await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: imageToDelete.publicId,
          }),
        });

        const deleteResult = await deleteResponse.json();
        console.log("Delete response:", deleteResult);

        if (!deleteResponse.ok && !deleteResult.warning) {
          throw new Error(
            deleteResult.error || "Gagal menghapus gambar dari server"
          );
        }
      }
      // Jika tidak ada publicId tersimpan, ekstrak dari URL
      else if (
        imageToDelete &&
        imageToDelete.src &&
        imageToDelete.src.includes("cloudinary")
      ) {
        // Ekstraksi publicId dari URL (kode yang sudah ada)
        const urlParts = imageToDelete.src.split("/upload/");
        if (urlParts.length < 2) {
          console.error("Invalid Cloudinary URL format");
          throw new Error("Format URL tidak valid");
        }

        // Ambil bagian setelah /upload/
        let publicIdWithVersion = urlParts[1];

        // Hapus version number jika ada (v1234/)
        if (publicIdWithVersion.match(/^v\d+\//)) {
          publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, "");
        }

        // Hapus ekstensi file (.jpg, .png, dll) tapi pertahankan struktur folder
        const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, "");

        // Kirim permintaan ke API untuk menghapus gambar dari Cloudinary
        const deleteResponse = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: publicId,
          }),
        });

        const deleteResult = await deleteResponse.json();
        console.log("Delete response:", deleteResult);

        if (!deleteResponse.ok && !deleteResult.warning) {
          throw new Error(
            deleteResult.error || "Gagal menghapus gambar dari server"
          );
        }
      }

      // Hapus dari preview dan form data (kode yang sudah ada)
      setPreviewImages((prev) => {
        const newPreviewImages = [...prev];
        if (newPreviewImages[index].url.startsWith("blob:")) {
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

      // Tampilkan pesan sukses
      Swal.fire({
        title: "Berhasil",
        text: "Gambar berhasil dihapus",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus gambar. " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form
    if (!validateForm()) {
      Swal.fire({
        title: "Validasi Gagal",
        text: "Mohon periksa kembali form Anda",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = {
        ...form,
        name: form.name,
        developer: form.developer,
        id: form.name,
      };
      const res = await fetch(`/api/residential/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memperbarui data");
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Data properti berhasil diperbarui",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push(`/admin/residential/${id}`);
      });
    } catch (err) {
      console.error("Error updating property:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Terjadi kesalahan saat memperbarui data",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form.name) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Properti Residential</h1>
        <button
          onClick={() => router.push(`/admin/residential`)}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Kembali
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID Properti (Read-only display) */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">ID Properti</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
              {form.id || form._id}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ID tidak dapat diubah setelah properti dibuat
            </p>
          </div>

          {/* Nama Properti */}
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">
              Nama Properti <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Harga Awal */}
          <div>
            <label className="block font-medium mb-1">
              Harga Awal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              name="startPrice"
              type="number"
              value={form.startPrice || ""}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startPrice ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.startPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.startPrice}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Masukkan angka tanpa titik atau koma.
            </p>
          </div>

          {/* Developer */}
          <div>
            <label className="block font-medium mb-1">
              Developer <span className="text-red-500">*</span>
            </label>
            <input
              name="developer"
              value={form.developer || ""}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.developer ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.developer && (
              <p className="text-red-500 text-sm mt-1">{errors.developer}</p>
            )}
          </div>

          {/* Status Properti */}
          <div>
            <label className="block font-medium mb-1">Status Properti</label>
            <select
              name="propertyStatus"
              value={form.propertyStatus || "SALE"}
              onChange={handleChange}
              className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SALE">Dijual</option>
              <option value="SOLD">Terjual Habis</option>
              <option value="COMING_SOON">Segera Hadir</option>
            </select>
          </div>
        </div>

        {/* Lokasi */}
        <fieldset className="border p-6 rounded-md shadow-sm">
          <legend className="text-lg font-semibold px-2">Detail Lokasi</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block font-medium mb-1">Region</label>
              <input
                name="location.region"
                value={form.location?.region || ""}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Kota <span className="text-red-500">*</span>
              </label>
              <input
                name="location.city"
                value={form.location?.city || ""}
                onChange={handleChange}
                className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors["location.city"] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors["location.city"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["location.city"]}
                </p>
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">
                Area <span className="text-red-500">*</span>
              </label>
              <input
                name="location.area"
                value={form.location?.area || ""}
                onChange={handleChange}
                className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors["location.area"] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors["location.area"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["location.area"]}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Alamat Lengkap</label>
              <input
                name="location.address"
                value={form.location?.address || ""}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Link Google Maps</label>
              <input
                name="location.mapsLink"
                value={form.location?.mapsLink || ""}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </fieldset>

        {/* Deskripsi */}
        <div>
          <label className="block font-medium mb-1">Deskripsi Properti</label>
          <textarea
            name="description"
            value={form.description || ""}
            onChange={handleChange}
            rows={5}
            className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan deskripsi properti..."
          ></textarea>
        </div>

        {/* Galeri Gambar */}
        <fieldset className="border p-6 rounded-md shadow-sm">
          <legend className="text-lg font-semibold px-2">Galeri Gambar</legend>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
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
              onClick={() => fileInputRef.current.click()}
              className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting || uploadProgress > 0}
            >
              <FaUpload className="mr-2" />
              Pilih Gambar
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, PNG, WebP. Maksimal 10 gambar.
            </p>
          </div>

          {/* Preview Images */}
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={200}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus gambar"
                  >
                    <FaTrash size={12} />
                  </button>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {previewImages.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
              <p className="text-gray-400">Belum ada gambar yang diunggah</p>
            </div>
          )}
        </fieldset>

        {/* Tombol Submit */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
