"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import ImageGalleryUpload from "../../components/ImageGalleryUpload";

export default function ClusterForm({
  clusterId = null, // ID cluster untuk mode edit
  initialData = {},
  onSubmit,
  isEditing = false,
  isSubmitting = false,
  propertyInfo,
  showHeader = true, // Option untuk menampilkan header atau tidak
  showBackButton = true, // Option untuk menampilkan tombol back
}) {
  const router = useRouter();

  // State untuk data form
  const [form, setForm] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    gallery: initialData.gallery || [],
  });

  // State untuk preview images
  const [previewImages, setPreviewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch data cluster jika mode edit dan ada clusterId
  useEffect(() => {
    const fetchClusterData = async () => {
      if (isEditing && clusterId && !initialData.name) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/clusters/${clusterId}`);
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Gagal mengambil data cluster");

          const clusterData = data.cluster;
          setForm({
            name: clusterData.name || "",
            description: clusterData.description || "",
            gallery: clusterData.gallery || [],
          });

          // Set preview images dari gallery yang sudah ada
          if (clusterData.gallery && clusterData.gallery.length > 0) {
            const existingImages = clusterData.gallery.map((img, index) => ({
              url: img.src || img.url,
              name: img.alt || img.name || `Image ${index + 1}`,
              uploaded: true,
              publicId: img.publicId,
              size: img.size,
            }));
            setPreviewImages(existingImages);
          }
        } catch (error) {
          console.error("Error fetching cluster:", error);
          Swal.fire("Error", error.message, "error");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClusterData();
  }, [clusterId, isEditing, initialData.name]);

  // Efek untuk mengisi form dari initialData (untuk mode inline)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        gallery: initialData.gallery || [],
      });

      // Set preview images dari gallery yang sudah ada
      if (initialData.gallery && initialData.gallery.length > 0) {
        const existingImages = initialData.gallery.map((img, index) => ({
          url: img.src || img.url,
          name: img.alt || img.name || `Image ${index + 1}`,
          uploaded: true,
          publicId: img.publicId,
          size: img.size,
        }));
        setPreviewImages(existingImages);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error saat user mulai mengetik
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama Cluster wajib diisi";
    }

    if (form.name.trim().length < 3) {
      newErrors.name = "Nama Cluster minimal 3 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire("Validasi Gagal", "Mohon periksa kembali data yang diisi.", "error");
      return;
    }

    // Jika ada onSubmit prop, gunakan itu (untuk mode inline)
    if (onSubmit) {
      onSubmit(form);
      return;
    }

    // Jika tidak ada onSubmit, handle submit sendiri (untuk mode standalone)
    try {
      const url = isEditing ? `/api/clusters/${clusterId}` : "/api/clusters";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...form,
        ...(clusterId && { id: clusterId }),
        ...(propertyInfo?.propertyId && { propertyId: propertyInfo.propertyId }),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan cluster");

      Swal.fire({
        title: "Berhasil!",
        text: isEditing ? "Cluster berhasil diperbarui." : "Cluster baru berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // Redirect setelah berhasil
        if (isEditing) {
          router.push(`/admin/clusters/${clusterId}`);
        } else {
          router.push(`/admin/properties/${propertyInfo?.propertyId || ''}`);
        }
      });

    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-blue-500 text-2xl mr-3" />
          <span className="text-gray-600">Memuat data cluster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                type="button"
              >
                <FaArrowLeft />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Edit Cluster" : "Tambah Cluster Baru"}
              </h1>
              {propertyInfo?.propertyName && (
                <p className="text-gray-600 mt-1">
                  Properti: <strong>{propertyInfo.propertyName}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Nama Cluster <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Contoh: Cluster Bougenville"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deskripsi singkat mengenai cluster"
          />
        </div>

        {/* Gallery Upload - Menggunakan komponen reusable */}
        <ImageGalleryUpload
          previewImages={previewImages}
          setPreviewImages={setPreviewImages}
          form={form}
          setForm={setForm}
          isSubmitting={isSubmitting}
          maxImages={8}
          assetType={propertyInfo?.assetType || "Perumahan"}
          propertyName={propertyInfo?.propertyName || ""}
          clusterName={form.name}
          uploadType="cluster"
          title="Galeri Gambar Cluster"
          description="Format yang didukung: JPG, PNG, WebP. Maksimal Ukuran: 10MB per file."
          aspectRatio="aspect-[4/3]"
          gridCols="grid-cols-2 md:grid-cols-3"
          required={false}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
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
            disabled={isSubmitting || !form.name.trim()}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isSubmitting && <FaSpinner className="animate-spin mr-2" />}
            {isEditing ? "Simpan Perubahan" : "Tambah Cluster"}
          </button>
        </div>
      </form>
    </div>
  );
}
