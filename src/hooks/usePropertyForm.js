// src/hooks/usePropertyForm.js
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import useNotification from "./useNotification";
import { generateId } from "@/utils/generateSlug";
import { toCapitalCase } from "@/utils/toCapitalcase";

export default function usePropertyForm(propertyId = null) {
  const router = useRouter();
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");

  // Function to get text length from HTML (for validation)
  const getTextLength = useCallback((htmlContent) => {
    if (!htmlContent) return 0;
    const div = document.createElement("div");
    div.innerHTML = htmlContent;
    return (div.textContent || div.innerText || "").length;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama properti wajib diisi";
    if (!form.startPrice) newErrors.startPrice = "Harga awal wajib diisi";
    if (!form.developer.trim()) newErrors.developer = "Nama developer wajib diisi";
    if (!form.location.city.trim()) newErrors["location.city"] = "Kota wajib diisi";
    if (!form.location.area.trim()) newErrors["location.area"] = "Area wajib diisi";
    if (!form.assetType) newErrors.assetType = "Tipe Aset wajib dipilih";
    if (!form.marketStatus) newErrors.marketStatus = "Status Pasar wajib dipilih";
    if (!form.listingStatus) newErrors.listingStatus = "Status Ketersediaan wajib dipilih";

    if (form.startPrice && (isNaN(form.startPrice) || Number(form.startPrice) <= 0)) {
      newErrors.startPrice = "Harga harus berupa angka positif";
    }

    const textContent = getTextLength(form.description);
    if (textContent.trim().length > 0 && textContent.trim().length < 50) {
      newErrors.description = "Deskripsi minimal 50 karakter jika diisi";
    }
    if (textContent.length > 1000) {
      newErrors.description = "Deskripsi maksimal 1000 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, getTextLength]);

  const handleChange = useCallback((e) => {
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
  }, [errors, isEdit]);

  const handleDescriptionChange = useCallback((content) => {
    setForm((prev) => ({ ...prev, description: content }));

    if (errors.description) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  }, [errors.description]);

  const submitForm = useCallback(async (additionalData = {}) => {
    if (!validateForm()) {
      notify.error("Mohon periksa kembali form Anda");
      return false;
    }
    if (form.gallery.length === 0) {
      notify.warning("Mohon upload minimal satu gambar.");
      return false;
    }

    setIsSubmitting(true);
    try {
      const formattedData = {
        ...form,
        ...additionalData,
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

      notify.success(`Properti berhasil ${isEdit ? "diperbarui" : "ditambahkan"}!`);
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
      return true;
    } catch (err) {
      notify.error(err.message || "Terjadi kesalahan saat menyimpan data");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, validateForm, notify, isEdit, propertyId, router]);

  return {
    form,
    setForm,
    errors,
    setErrors,
    isSubmitting,
    isLoading,
    setIsLoading,
    autoSaveStatus,
    setAutoSaveStatus,
    validateForm,
    handleChange,
    handleDescriptionChange,
    submitForm,
    isEdit,
  };
}
