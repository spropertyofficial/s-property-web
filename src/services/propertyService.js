// src/services/propertyService.js

import { residentialsData as staticResidentialsData } from "@/data/residentials";
import { getResidentialsData } from "@/app/api/residential/route";

// Fungsi untuk mendapatkan SEMUA properti (statis + dinamis)
export async function getAllResidentials() {
  let dynamicResidentials = [];
  try {
    // Panggil logika langsung untuk efisiensi di server
    dynamicResidentials = await getResidentialsData();
  } catch (error) {
    console.error("Failed to get dynamic residentials, continuing with static data only.", error);
    // Jika gagal, kita lanjutkan dengan data statis saja
  }

  // Gabungkan dan de-duplikasi data
  const combinedDataMap = new Map();

  // Masukkan data statis terlebih dahulu
  staticResidentialsData.forEach(item => {
    combinedDataMap.set(item.id, item);
  });

  // Timpa atau tambahkan dengan data dinamis
  dynamicResidentials.forEach(item => {
    const normalizedId = item._id ? item._id.toString() : item.id;
    combinedDataMap.set(normalizedId, { ...item, id: normalizedId });
  });

  return Array.from(combinedDataMap.values());
}


// Fungsi untuk mendapatkan SATU properti berdasarkan ID
export async function getResidentialById(id) {
  // Panggil fungsi di atas untuk mendapatkan semua data gabungan
  const allResidentials = await getAllResidentials();
  
  // Cari properti di dalam data gabungan tersebut
  const property = allResidentials.find(p => p.id === id);

  return property || null;
}