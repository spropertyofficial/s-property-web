// Hapus semua folder seperti /admin/perumahan/[id], /admin/ruko/[id], dll.
// Gunakan file ini sebagai gantinya.

import { notFound } from "next/navigation";
// Impor fungsi untuk mengambil data langsung di Server Component
import { getPropertyById } from "@/services/propertyService";
import ClusterManager from "../../components/Properties/ClusterManager";
import UnitTypeManager from "../../clusters/components/UnitTypeManager";

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
  const assetTypeName = plainProperty.assetType?.name;
  const isPerumahan = assetTypeName === "Perumahan";
  const isApartemen = assetTypeName === "Apartemen";
  const isPerumahanOrApartemen = isPerumahan || isApartemen;

  // Untuk Apartemen, cari cluster default untuk mengambil unit types
  let defaultCluster = null;
  if (isApartemen && plainProperty.clusters?.length > 0) {
    defaultCluster = plainProperty.clusters.find(cluster => 
      cluster.name === "Cluster Default"
    ) || plainProperty.clusters[0]; // Fallback ke cluster pertama jika tidak ada yang bernama "Cluster Default"
  }


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

      {isPerumahan && (
        <ClusterManager
          propertyId={plainProperty.id}
          propertyName={plainProperty.name}
        />
      )}

      {isApartemen && defaultCluster && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Manajemen Tipe Unit
          </h2>
          <p className="text-gray-600 mb-6">
            Kelola tipe unit untuk apartemen {plainProperty.name}
          </p>
          <UnitTypeManager
            clusterId={defaultCluster._id || defaultCluster.id}
            clusterName={plainProperty.name}
            initialUnitTypes={defaultCluster.unitTypes || []}
          />
        </div>
      )}
      {/* Anda bisa menambahkan komponen lain di sini untuk tipe properti yang berbeda */}
      {/* Contoh:
        {plainProperty.assetType?.name === 'Tanah' && <InformasiZonasi data={plainProperty.zoningInfo} />}
      */}
    </div>
  );
}
