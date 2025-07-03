"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaUpload, FaTrash, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { handleImageUpload as uploadImage } from "@/utils/handleImagesUpload";
import { generateId } from "@/utils/generateSlug";
import { toCapitalCase } from "@/utils/toCapitalcase";

export default function PropertyFormPage({ propertyId = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const isEdit = !!propertyId;

  const initialFormState = {
    id: "",
    name: "",
    startPrice: "",
    developer: "",
    assetType: "",
    marketStatus: "",
    listingStatus: "",
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
  };

  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  const [categories, setCategories] = useState({
    assetTypes: [],
    marketStatuses: [],
    listingStatuses: [],
  });
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [assetRes, marketRes, listingRes] = await Promise.all([
          fetch("/api/categories/asset-types"),
          fetch("/api/categories/market-status"),
          fetch("/api/categories/listing-status"),
        ]);
        const assetData = await assetRes.json();
        const marketData = await marketRes.json();
        const listingData = await listingRes.json();
        setCategories({
          assetTypes: assetData.assetTypes || [],
          marketStatuses: marketData.marketStatus || [],
          listingStatuses: listingData.listingStatus || [],
        });
      } catch (error) {
        Swal.fire("Error", "Gagal memuat data kategori.", "error");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch property data if editing
  useEffect(() => {
    if (isEdit && propertyId) {
      const fetchProperty = async () => {
        try {
          setIsLoading(true);
          const res = await fetch(`/api/properties/${propertyId}`);
          if (!res.ok) throw new Error("Property tidak ditemukan");

          const data = await res.json();
          const property = data.property;

          setForm({
            ...property,
            assetType: property.assetType?._id || "",
            marketStatus: property.marketStatus?._id || "",
            listingStatus: property.listingStatus?._id || "",
          });

          // Set preview images dari gallery yang sudah ada dengan struktur yang sesuai response API
          if (property.gallery && property.gallery.length > 0) {
            const existingImages = property.gallery.map((img) => ({
              url: img.src, // menggunakan 'src' bukan 'url'
              name: img.alt || `Image`,
              uploaded: true,
              publicId: img.publicId,
            }));
            setPreviewImages(existingImages);
          }
        } catch (error) {
          Swal.fire("Error", error.message, "error").then(() => {
            router.push("/admin/properties");
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
  }, [isEdit, propertyId, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama properti wajib diisi";
    if (!form.startPrice) newErrors.startPrice = "Harga awal wajib diisi";
    if (!form.developer.trim())
      newErrors.developer = "Nama developer wajib diisi";
    if (!form.location.city.trim())
      newErrors["location.city"] = "Kota wajib diisi";
    if (!form.location.area.trim())
      newErrors["location.area"] = "Area wajib diisi";
    if (!form.assetType) newErrors.assetType = "Tipe Aset wajib dipilih";
    if (!form.marketStatus)
      newErrors.marketStatus = "Status Pasar wajib dipilih";
    if (!form.listingStatus)
      newErrors.listingStatus = "Status Ketersediaan wajib dipilih";

    if (
      form.startPrice &&
      (isNaN(form.startPrice) || Number(form.startPrice) <= 0)
    ) {
      newErrors.startPrice = "Harga harus berupa angka positif";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      setForm((prev) => {
        const updatedForm = { ...prev, [name]: value };
        if (name === "name" && !isEdit) {
          updatedForm.id = generateId(value);
        }
        return updatedForm;
      });
    }
  };

  const handleImageUpload = (e) => {
    const selectedAssetType = categories.assetTypes.find(
      (cat) => cat._id === form.assetType
    );
    uploadImage(e, {
      previewImages,
      setPreviewImages,
      form,
      setForm,
      maxImages: 10,
      assetType: selectedAssetType ? selectedAssetType.name : "lainnya",
      propertyName: form.name,
      setUploadProgress,
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
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Gagal menghapus gambar. " + error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Validasi Gagal", "Mohon periksa kembali form Anda", "error");
      return;
    }
    if (form.gallery.length === 0) {
      Swal.fire(
        "Gambar belum diupload",
        "Mohon upload minimal satu gambar.",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...form,
        name: toCapitalCase(form.name),
        id: isEdit ? form.id : generateId(form.name),
      };

      const url = isEdit ? `/api/properties/${propertyId}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      Swal.fire(
        "Berhasil!",
        `Properti berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
        "success",
        {
          timer: 1500,
          showConfirmButton: false,
        }.then(() => {
          router.back();
        })
      );
    } catch (err) {
      Swal.fire("Error", err.message || "Terjadi kesalahan", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data properti...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Edit Properti" : "Tambah Properti Baru"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm space-y-6 mt-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block font-medium mb-1">
              Nama Properti <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Contoh: Terravia BSD"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
            {form.name && !isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                ID yang akan di-generate:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {generateId(form.name)}
                </code>
              </p>
            )}
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                ID properti:{" "}
                <code className="bg-gray-100 px-1 rounded">{form.id}</code>
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Harga Awal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              name="startPrice"
              type="number"
              value={form.startPrice}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startPrice ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Contoh: 1000000000"
            />
            {errors.startPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.startPrice}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Developer <span className="text-red-500">*</span>
            </label>
            <input
              name="developer"
              value={form.developer}
              onChange={handleChange}
              className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.developer ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Contoh: PT Sinar Mas Land"
            />
            {errors.developer && (
              <p className="text-red-500 text-sm mt-1">{errors.developer}</p>
            )}
          </div>
        </div>

        {/* Kategorisasi Properti */}
        <fieldset className="border border-gray-200 p-6 rounded-lg shadow-sm bg-gray-50">
          <legend className="text-lg font-semibold px-3 text-gray-800 bg-white">
            Kategorisasi Properti
          </legend>
          {loadingCategories ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Memuat kategori...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tipe Aset <span className="text-red-500">*</span>
                </label>
                <select
                  name="assetType"
                  value={form.assetType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.assetType
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="" className="text-gray-500">
                    Pilih Tipe Aset
                  </option>
                  {categories.assetTypes.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="text-gray-800"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.assetType && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                    {errors.assetType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status Pasar <span className="text-red-500">*</span>
                </label>
                <select
                  name="marketStatus"
                  value={form.marketStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.marketStatus
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="" className="text-gray-500">
                    Pilih Status Pasar
                  </option>
                  {categories.marketStatuses.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="text-gray-800"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.marketStatus && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                    {errors.marketStatus}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status Ketersediaan <span className="text-red-500">*</span>
                </label>
                <select
                  name="listingStatus"
                  value={form.listingStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.listingStatus
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <option value="" className="text-gray-500">
                    Pilih Status Ketersediaan
                  </option>
                  {categories.listingStatuses.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat._id}
                      className="text-gray-800"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.listingStatus && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                    {errors.listingStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </fieldset>

        {/* Detail Lokasi */}
        <fieldset className="border p-6 rounded-md shadow-sm">
          <legend className="text-lg font-semibold px-2">Detail Lokasi</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block font-medium mb-1">Region</label>
              <input
                name="location.region"
                value={form.location.region}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Jawa Barat"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Kota <span className="text-red-500">*</span>
              </label>
              <input
                name="location.city"
                value={form.location.city}
                onChange={handleChange}
                className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors["location.city"] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: Tangerang Selatan"
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
                value={form.location.area}
                onChange={handleChange}
                className={`input w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors["location.area"] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: BSD City"
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
                value={form.location.address}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Jl. BSD Raya Utama, Pagedangan, Kec. Pagedangan"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium mb-1">Link Google Maps</label>
              <input
                name="location.mapsLink"
                value={form.location.mapsLink}
                onChange={handleChange}
                className="input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: https://maps.app.goo.gl/..."
              />
            </div>
          </div>
        </fieldset>

        {/* Galeri Gambar */}
        <fieldset className="border p-6 rounded-md shadow-sm">
          <legend className="text-lg font-semibold px-2">Galeri Gambar</legend>

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
              disabled={isSubmitting || isUploading}
            >
              <FaUpload className="mr-2" />
              {isUploading ? "Sedang Mengupload..." : "Pilih Gambar"}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, PNG, WebP. Maksimal Ukuran: 10MB.
            </p>
          </div>

          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`aspect-video bg-gray-100 rounded-md overflow-hidden ${
                      image.error
                        ? "border-2 border-red-500"
                        : image.uploaded
                        ? "border-2 border-green-500"
                        : ""
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                    {image.uploaded && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Terupload
                      </div>
                    )}
                    {image.error && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Gagal
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus gambar"
                    disabled={isUploading}
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
          <p className="text-xs text-gray-500 mt-1">Maksimal 10 Gambar.</p>
        </fieldset>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            disabled={isSubmitting || isUploading}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {isEdit ? "Memperbarui..." : "Menyimpan..."}
              </>
            ) : isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Menunggu Upload...
              </>
            ) : (
              `${isEdit ? "Perbarui" : "Simpan"} Properti`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
