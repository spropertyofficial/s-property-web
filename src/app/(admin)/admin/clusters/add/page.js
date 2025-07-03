"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import ClusterForm from "../components/ClusterForm";

export default function AddClusterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil info properti induk dari URL
  const propertyId = searchParams.get("propertyId");
  const propertyName = searchParams.get("propertyName");
  const assetType = searchParams.get("assetType");

  const handleAddCluster = async (formData) => {
    if (!propertyId) {
      Swal.fire("Error", "ID Properti induk tidak ditemukan.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData, propertyId };
      const res = await fetch("/api/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Swal.fire("Berhasil!", "Cluster baru telah ditambahkan.", "success").then(
        () => {
          // Kembali ke halaman detail properti induknya
          router.push(`/admin/properties/${propertyId}`);
          router.refresh();
        }
      );
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Tambah Cluster Baru</h1>
      <p className="text-gray-500 mb-6">
        Untuk Properti: <strong>{propertyName}</strong>
      </p>
      <ClusterForm
        onSubmit={handleAddCluster}
        isSubmitting={isSubmitting}
        propertyInfo={{ propertyName, assetType }}
        initialData={{ name: "", description: "", gallery: [] }}
      />
    </div>
  );
}
