"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

// Form ini bisa untuk Tambah dan Edit
export default function UnitFormPage({ unitId = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = !!unitId;

  // Untuk mode Tambah, kita ambil clusterId dari URL
  const clusterId = isEditing ? null : searchParams.get("clusterId");

  const [form, setForm] = useState({
    name: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    landSize: "",
    buildingSize: "",
    carport: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchUnitData = async () => {
        // Logika fetch data unit by ID untuk mengisi form
      };
      fetchUnitData();
    }
  }, [unitId, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = isEditing ? `/api/units/${unitId}` : "/api/units";
    const method = isEditing ? "PUT" : "POST";

    const body = {
      ...form,
      clusterId: isEditing ? form.cluster._id : clusterId, // Pastikan clusterId terkirim
    };

    // Logika submit form (POST atau PUT)
    // ...
  };

  if (loading) return <p>Loading form...</p>;

  return (
    <form onSubmit={handleSubmit}>
      {/* ... Seluruh field input untuk Tipe Unit (nama, harga, kamar tidur, dll) ... */}
      <button type="submit" disabled={isSubmitting}>
        {isEditing ? "Simpan Perubahan" : "Tambah Tipe Unit"}
      </button>
    </form>
  );
}
