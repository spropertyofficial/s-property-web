"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaUpload, FaTrash, FaSpinner } from "react-icons/fa";
import Image from "next/image";
import { handleImageUpload as uploadImage } from "@/utils/handleImagesUpload";
import { generateId } from "@/utils/generateSlug";
import { toCapitalCase } from "@/utils/toCapitalcase";

export default function AddResidentialPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const initialFormState = {
    id: "",
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
  };

  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Validasi form
  const validateForm = () => {
    const newErrors = {};

    // Validasi field wajib
    if (!form.name.trim()) newErrors.name = "Nama properti wajib diisi";
    if (!form.startPrice) newErrors.startPrice = "Harga awal wajib diisi";
    if (!form.developer.trim())
      newErrors.developer = "Nama developer wajib diisi";

    // Validasi lokasi
    if (!form.location.city.trim())
      newErrors["location.city"] = "Kota wajib diisi";
    if (!form.location.area.trim())
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
      setForm((prev) => {
        const updatedForm = { ...prev, [name]: value };

        // Jika yang diubah adalah nama, generate ID otomatis
        if (name === "name") {
          updatedForm.id = generateId(value);
        }

        return updatedForm;
      });
    }
  };

  const handleImageUpload = (e) => {
    uploadImage(e, {
      previewImages,
      setPreviewImages,
      form,
      setForm,
      maxImages: 10,
      residentialName: form.name,
      setUploadProgress,
    });
  };

  const removeImage = async (index) => {
    try {
      const imageToRemove = previewImages[index];

      // Jika gambar memiliki publicId (sudah diupload ke Cloudinary)
      if (imageToRemove.publicId) {
        console.log("Deleting image with publicId:", imageToRemove.publicId);

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
        console.log("Delete response:", deleteResult);

        if (!deleteResponse.ok && !deleteResult.warning) {
          throw new Error(
            deleteResult.error || "Gagal menghapus gambar dari server"
          );
        }
      }

      // Hapus dari preview
      setPreviewImages((prev) => {
        const newPreviewImages = [...prev];
        // Bebaskan URL objek untuk mencegah memory leak
        if (newPreviewImages[index].url.startsWith("blob:")) {
          URL.revokeObjectURL(newPreviewImages[index].url);
        }
        newPreviewImages.splice(index, 1);
        return newPreviewImages;
      });

      // Hapus dari form data
      setForm((prev) => {
        const newGallery = [...(prev.gallery || [])];
        newGallery.splice(index, 1);
        return { ...prev, gallery: newGallery };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (form.gallery.length === 0) {
      Swal.fire({
        title: "Gambar belum diupload",
        text: "Mohon upload minimal satu gambar sebelum menyimpan.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = {
        ...form,
        name: toCapitalCase(form.name),
        id: generateId(form.name), // Pastikan ID ter-generate dari nama final
      };
      console.log(formattedData);
      const res = await fetch("/api/residential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();
      console.log(res);

      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");

      Swal.fire({
        title: "Berhasil!",
        text: "Properti residential berhasil ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        router.push("/admin/residential");
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err.message || "Terjadi kesalahan saat menyimpan data",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tambah Properti Residential Baru</h1>
        <button
          onClick={() => router.back()}
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
          {/* Nama Properti */}
          {/* Nama Properti */}
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
            {/* Preview ID yang akan di-generate */}
            {form.name && (
              <p className="text-xs text-gray-500 mt-1">
                ID yang akan di-generate:{" "}
                <code className="bg-gray-100 px-1 rounded">
                  {generateId(form.name)}
                </code>
              </p>
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

          {/* Status Properti */}
          <div>
            <label className="block font-medium mb-1">Status Properti</label>
            <select
              name="propertyStatus"
              value={form.propertyStatus}
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
              disabled={isSubmitting || isUploading}
            >
              <FaUpload className="mr-2" />
              {isUploading ? "Sedang Mengupload..." : "Pilih Gambar"}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Format yang didukung: JPG, PNG, WebP. Maksimal Ukuran: 10MB.
            </p>
          </div>

          {/* Preview Images */}
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
          <p className="text-xs text-gray-500 mt-1">
            Maksimal 10 Gambar.
          </p>
        </fieldset>

        {/* Tombol Submit */}
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
                Menyimpan...
              </>
            ) : isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Menunggu Upload...
              </>
            ) : (
              "Simpan Properti"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
