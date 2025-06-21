// src/services/residentialApi.js

import { getBaseUrl } from "@/lib/utils/getBaseUrl";

export async function getResidentials() {
  try {
    const baseUrl = getBaseUrl();
    const apiUrl = `${baseUrl}/api/residential`;
    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Gagal mengambil data properti");
    }

    const data = await res.json();
    return data.residentials || [];
  } catch (error) {
    console.error("Error in getResidentials service:", error.message);
    throw error;
  }
}
