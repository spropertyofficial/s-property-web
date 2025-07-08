// src/services/propertyService.js

import { residentialsData as staticPropertiesData } from "@/data/residentials";
// PERBAIKAN: Impor fungsi logika langsung dari file API-nya
import { getPropertiesData } from "@/app/api/properties/route";

/**
 * Mengambil SEMUA properti (gabungan dari DB dan data statis).
 * Cocok untuk halaman daftar atau komponen yang butuh semua data.
 */
export async function getAllProperties() {
  let dynamicProperties = [];
  try {
    // PERBAIKAN: Panggil fungsi logika langsung, bukan lewat fetch.
    // Ini menghilangkan masalah URL dan lebih cepat.
    dynamicProperties = await getPropertiesData();
  } catch (error) {
    console.error(
      "Gagal mengambil properti dinamis, lanjut dengan data statis.",
      error
    );
  }

  // Logika penggabungan dan de-duplikasi Anda tetap sama (sudah benar)
  const combinedDataMap = new Map();

  staticPropertiesData.forEach((item) => {
    combinedDataMap.set(item.id, item);
  });

  dynamicProperties.forEach((item) => {
    const normalizedId = item._id ? item._id.toString() : item.id;
    combinedDataMap.set(normalizedId, { ...item, id: normalizedId });
  });

  return Array.from(combinedDataMap.values());
}

export async function getPropertyById(id) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4004"
      }/api/properties/${id}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const property = data.property;
        property.id = property._id.toString();
        return property;
      }
    }

    const staticProperty = staticPropertiesData.find((p) => p.id === id);
    if (staticProperty) return staticProperty;

    return null;
  } catch (error) {
    console.error(`Error saat mengambil properti dengan ID ${id}:`, error);
    return staticPropertiesData.find((p) => p.id === id) || null;
  }
}
