"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useNotification from "@/hooks/useNotification";
import ImageGalleryUpload from "@/app/(admin)/admin/components/ImageGalleryUpload";
import { FaSave, FaArrowLeft, FaSpinner } from "react-icons/fa";

export default function EditRegionCityImagePage() {
  const router = useRouter();
  const params = useParams();
  const notify = useNotification();
  const fileInputRef = useRef(null);
  const { id } = params;

  const [form, setForm] = useState({
    name: "",
    type: "region",
    isActive: true,
    gallery: [], // For ImageGalleryUpload compatibility
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Available locations from properties
  const [availableLocations, setAvailableLocations] = useState({
    regions: [],
    cities: []
  });
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Fetch existing data
  useEffect(() => {
    if (id) {
      fetchImageData();
      fetchAvailableLocations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAvailableLocations = async () => {
    try {
      setLoadingLocations(true);
      const res = await fetch("/api/available-locations");
      const data = await res.json();
      if (data.success) {
        setAvailableLocations({
          regions: data.regions,
          cities: data.cities
        });
      }
    } catch (error) {
      console.error("Error fetching available locations:", error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchImageData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/region-city-images/${id}`);
      const data = await res.json();
      
      if (data.success) {
        const imageData = data.image;
        setForm({
          name: imageData.name,
          type: imageData.type,
          isActive: imageData.isActive,
          gallery: [], // For ImageGalleryUpload compatibility
        });
        
        // Set preview images untuk ImageGalleryUpload
        if (imageData.image) {
          setPreviewImages([{
            src: imageData.image.src,
            alt: imageData.image.alt,
            publicId: imageData.image.publicId,
            name: imageData.name,
            uploaded: true,
            url: imageData.image.src
          }]);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching image data:", error);
      notify.error("Gagal memuat data gambar");
      router.push("/admin/region-city-images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset name when type changes
    if (name === "type") {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
        name: "" // Reset name when type changes
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
    
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

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = `${form.type === "region" ? "Region" : "Kota"} harus dipilih`;
    }

    if (!previewImages.length || !previewImages[0]?.uploaded) {
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

      // Get first uploaded image from previewImages
      const uploadedImage = previewImages[0];
      
      const submitData = {
        name: form.name,
        type: form.type,
        isActive: form.isActive,
        image: {
          src: uploadedImage.url, // ImageGalleryUpload uses 'url' not 'src'
          alt: form.name,
          publicId: uploadedImage.publicId,
        }
      };

      const res = await fetch(`/api/region-city-images/${id}`, {
        method: "PUT",
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Edit Gambar Region/Kota</h1>
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
                {form.type === "region" ? "Region" : "Kota"} <span className="text-red-500">*</span>
              </label>
              <select
                name="name"
                value={form.name}
                onChange={handleInputChange}
                disabled={loadingLocations}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">
                  {loadingLocations 
                    ? "Loading..." 
                    : `Pilih ${form.type === "region" ? "Region" : "Kota"}`
                  }
                </option>
                {form.type === "region" 
                  ? availableLocations.regions.map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))
                  : availableLocations.cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))
                }
              </select>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
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
        <ImageGalleryUpload
          previewImages={previewImages}
          setPreviewImages={setPreviewImages}
          form={form}
          setForm={setForm}
          maxImages={1}
          assetType="explore-cities"
          propertyName={form.name}
          uploadType={form.type}
          title="Gambar Region/Kota"
          description="Upload gambar untuk region/kota. Format: JPG, PNG, WebP (Max 10MB)."
          aspectRatio="aspect-video"
          gridCols="grid-cols-1"
          required={true}
          isSubmitting={isSubmitting}
        />
        {errors.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}

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
            disabled={isSubmitting}
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
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
