// src/services/residentialApi.js

export async function getResidentials() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004'; 
    const res = await fetch(`${apiBaseUrl}/api/residential`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Gagal mengambil data properti');
    }

    const data = await res.json();
    return data.residentials || [];
    
  } catch (error) {
    console.error("Error in getResidentials service:", error.message);
    throw error; 
  }
}