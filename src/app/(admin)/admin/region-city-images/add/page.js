"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useNotification from "@/hooks/useNotification";
import { handleImageUpload } from "@/utils/handleImagesUpload";
import { FaUpload, FaSpinner, FaSave, FaArrowLeft, FaTrash } from "react-icons/fa";
import Image from "next/image";

export default function AddRegionCityImagePage() {
  const router = useRouter();
  const notify = useNotification();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    type: "region",
    parentRegion: "",
    priority: 0,
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});

  // Fetch regions for city parent selection
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);

  useEffect(() => {
    if (form.type === "city") {
      fetchRegions();
    }
  }, [form.type]);

  const fetchRegions = async () => {
    try {
      setLoadingRegions(true);
      const res = await fetch("/api/region-city-images?type=region&isActive=true");
      const data = await res.json();
      if (data.success) {
        setRegions(data.images);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      notify.error("Format file harus JPG, PNG, atau WebP");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Ukuran file maksimal 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    uploadImageToCloudinary(file);
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Determine folder based on type
      const folder = form.type === "region" ? "regions" : "cities";
      
      const result = await handleImageUpload(
        file,
        `s-property/explore-cities/${folder}`,
        (progress) => setUploadProgress(progress)
      );

      setImage({
        src: result.secure_url,
        alt: form.name || file.name,
        publicId: result.public_id,
      });

      notify.success("Gambar berhasil diupload");
    } catch (error) {
      console.error("Upload error:", error);
      notify.error("Gagal upload gambar");
      setPreviewImage("");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }

    if (form.type === "city" && !form.parentRegion) {
      newErrors.parentRegion = "Parent region harus dipilih untuk kota";
    }

    if (!image) {
      newErrors.image = "Gambar harus diupload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      notify.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = {
        ...form,
        image: {
          ...image,
          alt: form.name // Update alt text with current name
        }
      };

      const res = await fetch("/api/region-city-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (data.success) {
        notify.success(data.message);
        router.push("/admin/region-city-images");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      notify.error(error.message || "Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Tambah Gambar Region/Kota</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="region">Region</option>
                <option value="city">Kota</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan nama region atau kota"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Parent Region (for cities) */}
            {form.type === "city" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  name="parentRegion"
                  value={form.parentRegion}
                  onChange={handleInputChange}
                  disabled={loadingRegions}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.parentRegion ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Pilih Region</option>
                  {regions.map(region => (
                    <option key={region._id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {errors.parentRegion && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentRegion}</p>
                )}
              </div>
            )}

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioritas
              </label>
              <input
                type="number"
                name="priority"
                value={form.priority}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              <p className="text-gray-500 text-xs mt-1">
                Angka lebih tinggi akan ditampilkan lebih dulu
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Gambar</h2>
          
          {!previewImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FaUpload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Klik untuk upload gambar atau drag & drop
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Format: JPG, PNG, WebP (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  "Pilih Gambar"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewImage}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  <FaTrash size={12} />
                </button>
              </div>
              
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          
          {errors.image && (
            <p className="text-red-500 text-sm mt-2">{errors.image}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <FaSave />
                Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
