"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useNotification from "@/hooks/useNotification";
import Swal from "sweetalert2";
import {
  FaUpload,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
  FaSave,
} from "react-icons/fa";
import Image from "next/image";
import { handleImageUpload as uploadImage } from "@/utils/handleImagesUpload";
import { generateId } from "@/utils/generateSlug";
import { toCapitalCase } from "@/utils/toCapitalcase";
import SpesificForms from "../properties/components/SpesificForms";
import RichTextEditor from "./RichTextEditor";
import FormSkeleton from "./FormSkeleton";
import { Asset } from "next/font/google";

export default function PropertyFormPage({ propertyId = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const notify = useNotification();
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
  const [hasMultipleClusters, setHasMultipleClusters] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(""); // "", "saving", "saved", "error"
  const [galleryError, setGalleryError] = useState("");


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
        console.error("Error loading categories:", error);
        notify.error("Gagal memuat data kategori. Silakan refresh halaman.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove notify from dependency to prevent loop

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

          // Safe merge dengan default values untuk mencegah undefined
          setForm({
            ...initialFormState,
            ...property,
            assetType: property.assetType?._id || "",
            marketStatus: property.marketStatus?._id || "",
            listingStatus: property.listingStatus?._id || "",
            location: {
              ...initialFormState.location,
              ...property.location,
            },
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
          console.error("Error loading property:", error);
          notify.error(error.message || "Gagal memuat data properti");
          router.push("/admin/properties");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, propertyId]); // Remove router, notify from dependency to prevent loop

  // Function to get text length from markdown content (consistent with RichTextEditor)
  const getTextLength = (content) => {
    if (!content || typeof content !== 'string') return 0;
    try {
      // Sama seperti di RichTextEditor - hitung karakter dari markdown
      return content
        .replace(/[#*_`\[\]()]/g, "") // Remove markdown syntax
        .replace(/\n/g, " ") // Replace newlines with spaces
        .trim().length;
    } catch (error) {
      console.error('Error getting text length:', error);
      return 0;
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Pastikan nilai adalah string sebelum memanggil trim()
    const safeTrim = (value) => (value || "").toString().trim();
    
    // Validasi field wajib umum
    if (!safeTrim(form.name)) {
      newErrors.name = "Nama properti wajib diisi";
    }
    
    if (!form.startPrice) {
      newErrors.startPrice = "Harga awal wajib diisi";
    } else if (isNaN(form.startPrice) || Number(form.startPrice) <= 0) {
      newErrors.startPrice = "Harga harus berupa angka positif";
    }
    
    if (!safeTrim(form.developer)) {
      newErrors.developer = "Nama developer wajib diisi";
    }
    
    if (!form.assetType) {
      newErrors.assetType = "Tipe Aset wajib dipilih";
    }
    
    if (!form.marketStatus) {
      newErrors.marketStatus = "Status Pasar wajib dipilih";
    }
    
    if (!form.listingStatus) {
      newErrors.listingStatus = "Status Ketersediaan wajib dipilih";
    }

    // Validasi field spesifik berdasarkan tipe aset
    const selectedAssetType = categories.assetTypes.find(
      (cat) => cat._id === form.assetType
    );
    const assetTypeName = selectedAssetType?.name;

    if (assetTypeName) {
      // Validasi location hanya untuk Perumahan
      if (assetTypeName === "Perumahan") {
        if (!safeTrim(form.location?.city)) {
          newErrors["location.city"] = "Kota wajib diisi";
        }
        
        if (!safeTrim(form.location?.area)) {
          newErrors["location.area"] = "Area wajib diisi";
        }
      }

      // Validasi untuk Apartemen
      if (assetTypeName === "Apartemen") {
        if (!form.buildingSize) {
          newErrors.buildingSize = "Luas bangunan wajib diisi";
        } else if (isNaN(form.buildingSize) || Number(form.buildingSize) <= 0) {
          newErrors.buildingSize = "Luas bangunan harus berupa angka positif";
        }
        
        if (!form.unitFloor) {
          newErrors.unitFloor = "Lantai unit wajib diisi";
        }
        
        if (!form.bedrooms) {
          newErrors.bedrooms = "Jumlah kamar tidur wajib dipilih";
        }
        
        if (!form.bathrooms) {
          newErrors.bathrooms = "Jumlah kamar mandi wajib dipilih";
        }
        
        if (!form.furnishing) {
          newErrors.furnishing = "Kondisi furnishing wajib dipilih";
        }
      }
      
      // Validasi untuk Kavling/Tanah
      if (assetTypeName === "Kavling" || assetTypeName === "Tanah") {
        if (!form.landSize) {
          newErrors.landSize = "Luas tanah wajib diisi";
        } else if (isNaN(form.landSize) || Number(form.landSize) <= 0) {
          newErrors.landSize = "Luas tanah harus berupa angka positif";
        }
        
        if (!form.certificateStatus) {
          newErrors.certificateStatus = "Status sertifikat wajib dipilih";
        }
      }
      
      // Validasi untuk Ruko
      if (assetTypeName === "Ruko") {
        if (!form.totalUnits) {
          newErrors.totalUnits = "Jumlah unit ruko wajib diisi";
        } else if (isNaN(form.totalUnits) || Number(form.totalUnits) <= 0) {
          newErrors.totalUnits = "Jumlah unit harus berupa angka positif";
        }
        
        if (!form.yearBuilt) {
          newErrors.yearBuilt = "Tahun dibangun wajib diisi";
        } else if (isNaN(form.yearBuilt) || Number(form.yearBuilt) < 1900 || Number(form.yearBuilt) > new Date().getFullYear()) {
          newErrors.yearBuilt = "Tahun dibangun tidak valid";
        }
        
        if (!form.buildingCondition) {
          newErrors.buildingCondition = "Kondisi bangunan wajib dipilih";
        }
        
        if (!form.certificateStatus) {
          newErrors.certificateStatus = "Status sertifikat wajib dipilih";
        }
        
        if (!form.businessSuitability) {
          newErrors.businessSuitability = "Jenis usaha yang cocok wajib dipilih";
        }
      }
      
      // Validasi untuk Perumahan
      if (assetTypeName === "Perumahan") {
        // Tambahkan validasi spesifik Perumahan di sini
        // Mari saya lihat PerumahanForm dulu untuk tahu field apa saja
      }
    }

    // Validasi description untuk markdown content
    const textContent = getTextLength(form.description);
    if (textContent > 0 && textContent < 50) {
      newErrors.description = "Deskripsi minimal 50 karakter jika diisi";
    }
    if (textContent > 1000) {
      newErrors.description = "Deskripsi maksimal 1000 karakter";
    }

    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [form, categories.assetTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Safe guard untuk memastikan value adalah string
    const safeValue = value || "";

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
        location: { 
          ...prev.location, 
          [key]: safeValue 
        },
      }));
    } else {
      setForm((prev) => {
        const updatedForm = { ...prev, [name]: safeValue };
        if (name === "name" && !isEdit && safeValue.trim()) {
          updatedForm.id = generateId(safeValue);
        }
        return updatedForm;
      });
    }
  };

  const handleDescriptionChange = (content) => {
    setForm((prev) => ({ ...prev, description: content }));

    // Clear error jika ada dan re-validate
    if (errors.description) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }

    // Validate immediately untuk real-time feedback
    const textLength = getTextLength(content);
    if (content && textLength > 0 && textLength < 50) {
      setErrors((prev) => ({
        ...prev,
        description: "Deskripsi minimal 50 karakter jika diisi"
      }));
    } else if (textLength > 1000) {
      setErrors((prev) => ({
        ...prev,
        description: "Deskripsi maksimal 1000 karakter"
      }));
    }
  };

  const handleImageUpload = (e) => {
    // Clear gallery error when user starts uploading
    if (galleryError) setGalleryError("");
    
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
    const confirm = await Swal.fire({
      title: "Hapus Gambar?",
      text: "Gambar akan dihapus permanen dari server",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

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

      notify.success("Gambar berhasil dihapus");
    } catch (error) {
      console.error("Error removing image:", error);
      notify.error("Gagal menghapus gambar: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset gallery error
    setGalleryError("");
    
    // Validasi form dan dapatkan error details
    const isValid = validateForm();
    if (!isValid) {
      // Kumpulkan semua error messages
      const errorMessages = Object.entries(errors).map(([field, message]) => {
        const fieldNames = {
          'name': 'Nama Properti',
          'startPrice': 'Harga Awal',
          'developer': 'Developer',
          'location.city': 'Kota',
          'location.area': 'Area',
          'assetType': 'Tipe Aset',
          'marketStatus': 'Status Pasar',
          'listingStatus': 'Status Ketersediaan',
          'description': 'Deskripsi',
          // Field Apartemen
          'buildingSize': 'Luas Bangunan',
          'unitFloor': 'Lantai Unit',
          'bedrooms': 'Jumlah Kamar Tidur',
          'bathrooms': 'Jumlah Kamar Mandi',
          'furnishing': 'Kondisi Furnishing',
          // Field Ruko
          'totalUnits': 'Jumlah Unit Ruko',
          'yearBuilt': 'Tahun Dibangun',
          'buildingCondition': 'Kondisi Bangunan',
          'businessSuitability': 'Jenis Usaha yang Cocok',
          // Field Kavling/Tanah
          'landSize': 'Luas Tanah',
          'certificateStatus': 'Status Sertifikat'
        };
        return `• ${fieldNames[field] || field}: ${message}`;
      });
      
      // Tampilkan error yang lebih spesifik
      const errorText = `Mohon lengkapi field berikut:\n${errorMessages.join('\n')}`;
      notify.error(errorText);
      
      // Scroll ke field pertama yang error
      scrollToFirstError();
      return;
    }
    
    // Validasi galeri terpisah dengan feedback visual
    if (form.gallery.length === 0) {
      setGalleryError("Minimal satu gambar harus diupload");
      notify.warning("Mohon upload minimal satu gambar.");
      // Scroll ke bagian galeri
      const gallerySection = document.querySelector('fieldset:has(legend)');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...form,
        name: toCapitalCase(form.name || ""),
        id: isEdit ? form.id : generateId(form.name || ""),
        hasMultipleClusters: hasMultipleClusters,
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

      notify.success(
        `Properti berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`
      );

      // Delay untuk memberikan waktu user melihat notifikasi
      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (err) {
      notify.error(err.message || "Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare template data
  const getTemplateData = () => {
    const selectedAssetType = categories.assetTypes.find(
      (cat) => cat._id === form.assetType
    );

    return {
      title: form.name || "",
      type: selectedAssetType?.name || "Properti",
      location:
        form.location?.area && form.location?.city
          ? `${form.location.area}, ${form.location.city}`
          : "",
      developer: form.developer || "",
      features: [], // Bisa diisi dengan data spesifik per tipe
      facilities: [], // Bisa diisi dengan data spesifik per tipe
    };
  };

  // Auto-save functionality
  useEffect(() => {
    if (!form.name || !isEdit) return; // Only auto-save when editing existing property

    const autoSaveTimer = setTimeout(async () => {
      if (validateForm()) {
        setAutoSaveStatus("saving");
        try {
          const formattedData = {
            ...form,
            name: toCapitalCase(form.name || ""),
            hasMultipleClusters: hasMultipleClusters,
          };

          const res = await fetch(`/api/properties/${propertyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formattedData, autoSave: true }),
          });

          if (res.ok) {
            setAutoSaveStatus("saved");
            setTimeout(() => setAutoSaveStatus(""), 2000);
          } else {
            throw new Error("Auto-save failed");
          }
        } catch (error) {
          console.error("Auto-save error:", error);
          setAutoSaveStatus("error");
          setTimeout(() => setAutoSaveStatus(""), 3000);
        }
      }
    }, 3000); // Auto-save after 3 seconds of no changes

    return () => clearTimeout(autoSaveTimer);
  }, [form, hasMultipleClusters, isEdit, propertyId, validateForm]); // Dependencies for auto-save

  // Function to scroll to first error field
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      // Mapping field names to actual input selectors
      const fieldSelectors = {
        'name': 'input[name="name"]',
        'startPrice': 'input[name="startPrice"]',
        'developer': 'input[name="developer"]',
        'location.city': 'input[name="location.city"]',
        'location.area': 'input[name="location.area"]',
        'assetType': 'select[name="assetType"]',
        'marketStatus': 'select[name="marketStatus"]',
        'listingStatus': 'select[name="listingStatus"]',
        'description': '.w-md-editor',
        // Field Apartemen
        'buildingSize': 'input[name="buildingSize"]',
        'unitFloor': 'input[name="unitFloor"]',
        'bedrooms': 'select[name="bedrooms"]',
        'bathrooms': 'select[name="bathrooms"]',
        'furnishing': 'select[name="furnishing"]',
        // Field Ruko
        'totalUnits': 'input[name="totalUnits"]',
        'yearBuilt': 'input[name="yearBuilt"]',
        'buildingCondition': 'select[name="buildingCondition"]',
        'businessSuitability': 'select[name="businessSuitability"]',
        // Field Kavling/Tanah
        'landSize': 'input[name="landSize"]',
        'certificateStatus': 'select[name="certificateStatus"]'
      };
      
      const selector = fieldSelectors[firstErrorField];
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Focus the element if it's an input
          if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
            setTimeout(() => element.focus(), 500);
          }
        }
      }
    }
  };

  if (isLoading) {
    return <FormSkeleton />;
  }
  const selectedAssetType = categories.assetTypes.find(
    (cat) => cat._id === form.assetType
  );
  const selectedAssetTypeName = selectedAssetType ? selectedAssetType.name : "";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Properti" : "Tambah Properti Baru"}
        </h1>

        {/* Auto-save status indicator */}
        {isEdit && (
          <div className="flex items-center gap-2">
            {autoSaveStatus === "saving" && (
              <div className="flex items-center text-blue-600 text-sm">
                <FaSpinner className="animate-spin mr-1" size={12} />
                Menyimpan...
              </div>
            )}
            {autoSaveStatus === "saved" && (
              <div className="flex items-center text-green-600 text-sm">
                <FaSave className="mr-1" size={12} />
                Tersimpan otomatis
              </div>
            )}
            {autoSaveStatus === "error" && (
              <div className="flex items-center text-red-600 text-sm">
                <FaInfoCircle className="mr-1" size={12} />
                Gagal menyimpan otomatis
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm space-y-6"
      >
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Mohon perbaiki {Object.keys(errors).length} kesalahan berikut:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {Object.entries(errors).map(([field, message]) => {
                      const fieldNames = {
                        'name': 'Nama Properti',
                        'startPrice': 'Harga Awal',
                        'developer': 'Developer',
                        'location.city': 'Kota',
                        'location.area': 'Area',
                        'assetType': 'Tipe Aset',
                        'marketStatus': 'Status Pasar',
                        'listingStatus': 'Status Ketersediaan',
                        'description': 'Deskripsi',
                        // Field Apartemen
                        'buildingSize': 'Luas Bangunan',
                        'unitFloor': 'Lantai Unit',
                        'bedrooms': 'Jumlah Kamar Tidur',
                        'bathrooms': 'Jumlah Kamar Mandi',
                        'furnishing': 'Kondisi Furnishing',
                        // Field Ruko
                        'totalUnits': 'Jumlah Unit Ruko',
                        'yearBuilt': 'Tahun Dibangun',
                        'buildingCondition': 'Kondisi Bangunan',
                        'businessSuitability': 'Jenis Usaha yang Cocok',
                        // Field Kavling/Tanah
                        'landSize': 'Luas Tanah',
                        'certificateStatus': 'Status Sertifikat'
                      };
                      return (
                        <li key={field}>
                          <strong>{fieldNames[field] || field}:</strong> {message}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
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

              {categories.assetTypes.find((cat) => cat._id === form.assetType)
                ?.name === "Perumahan" && (
                <div className="col-span-1 md:col-span-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMultipleClusters}
                      onChange={(e) => setHasMultipleClusters(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Memiliki beberapa cluster?
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Centang jika perumahan ini memiliki beberapa cluster/fase
                  </p>
                </div>
              )}
            </div>
          )}
        </fieldset>

        <SpesificForms
          assetTypeName={selectedAssetTypeName}
          form={form}
          handleChange={handleChange}
          errors={errors}
        />

        {selectedAssetTypeName && (
          <fieldset className="border border-gray-200 p-6 rounded-lg shadow-sm bg-gray-50">
            <legend className="text-lg font-semibold px-3 text-gray-800 bg-white/50 flex items-center">
              Deskripsi Properti
            </legend>

            <div className="mt-4">
              <RichTextEditor
                value={form.description}
                onChange={handleDescriptionChange}
                placeholder="Deskripsikan properti secara detail dengan formatting yang menarik..."
                maxLength={1000}
                minLength={50}
                label="Deskripsi Lengkap"
                required={false}
                error={errors.description}
                showTemplate={
                  !!(form.name && form.developer && form.location?.area)
                }
                templateData={getTemplateData()}
                showTips={true}
                showPreview={true}
              />
            </div>
          </fieldset>
        )}

        {/* Galeri Gambar */}
        {selectedAssetTypeName && (
          <fieldset className={`border p-6 rounded-md shadow-sm ${galleryError ? 'border-red-400 bg-red-50' : ''}`}>
            <legend className="text-lg font-semibold px-2 flex items-center">
              Galeri Gambar
              <span className="text-red-500 ml-1">*</span>
              {galleryError && (
                <span className="ml-2 text-sm text-red-500">({galleryError})</span>
              )}
            </legend>

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
        )}
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
