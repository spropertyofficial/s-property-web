// Hapus semua folder seperti /admin/perumahan/[id], /admin/ruko/[id], dll.
// Gunakan file ini sebagai gantinya.

import { notFound } from "next/navigation";
// Impor fungsi untuk mengambil data langsung di Server Component
import { getPropertyById } from "@/services/propertyService";
import ClusterManager from "../../components/Properties/ClusterManager";

// Ini adalah Server Component, bagus untuk mengambil data awal
export default async function PropertyDetailPageAdmin({ params }) {
  const { id } = params;

  // Ambil data properti lengkap di server
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  // Lakukan serialisasi data di sini jika Anda akan melemparnya ke Client Component lain
  const plainProperty = JSON.parse(JSON.stringify(property));

  // Cek tipe aset dari data yang didapat
  const isPerumahan =
    plainProperty.assetType?.name === "Perumahan" ||
    plainProperty.assetType?.name === "Apartemen";

  return (
    <div className="p-6">
      {/* Bagian Header Detail Properti */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <p className="text-sm font-semibold text-blue-600 mb-1">
          {plainProperty.assetType?.name}
        </p>
        <h1 className="text-3xl font-bold text-gray-800">
          {plainProperty.name}
        </h1>
        <p className="text-md text-gray-500 mt-1">
          {plainProperty.location?.area}, {plainProperty.location?.city}
        </p>
        {/* Anda bisa menambahkan lebih banyak detail properti di sini */}
      </div>

      {/* Tampilkan ClusterManager secara kondisional */}
      {/* Komponen ini HANYA akan muncul jika tipe propertinya adalah "Perumahan" atau "Apartemen" */}
      {isPerumahan && (
        <ClusterManager
          propertyId={plainProperty._id}
          propertyName={plainProperty.name}
        />
      )}

      {/* Anda bisa menambahkan komponen lain di sini untuk tipe properti yang berbeda */}
      {/* Contoh:
        {plainProperty.assetType?.name === 'Tanah' && <InformasiZonasi data={plainProperty.zoningInfo} />}
      */}
    </div>
  );
}
