"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaEdit,
  FaTrash,
  FaPlus,
  FaEye,
  FaSync,
  FaSpinner,
  FaHome,
  FaLayerGroup,
  FaArrowLeft,
} from "react-icons/fa";

export default function ClusterDetailPage({ params }) {
  const router = useRouter();

  // Unwrap params using React.use()
  const { id: clusterId } = use(params);

  const [clusterData, setClusterData] = useState(null);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data cluster dan unit types
  const fetchClusterData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/clusters/${clusterId}`);
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Gagal mengambil data cluster");

      setClusterData(data.cluster);
      setUnits(data.cluster.units || []);
    } catch (error) {
      console.error("Error fetching cluster:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [clusterId]);

  useEffect(() => {
    if (clusterId) {
      fetchClusterData();
    }
  }, [clusterId, fetchClusterData]);

  const handleDeleteUnit = async (unitId, unitName) => {
    Swal.fire({
      title: "Anda yakin?",
      text: `Tipe Unit "${unitName}" akan dihapus!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Tampilkan loading
          Swal.fire({
            title: "Menghapus...",
            text: "Sedang menghapus tipe unit",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const res = await fetch(`/api/units/${unitId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Gagal menghapus Tipe Unit");

          Swal.fire({
            title: "Terhapus!",
            text: data.message,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          // Fetch ulang data
          await fetchClusterData();
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-blue-500 text-3xl mr-4" />
          <span className="text-xl text-gray-600">Memuat data cluster...</span>
        </div>
      </div>
    );
  }

  if (!clusterData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Cluster Tidak Ditemukan
          </h1>
          <Link
            href="/admin/properties"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Kembali ke Daftar Properti
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaLayerGroup className="mr-3 text-blue-600" />
                {clusterData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Properti:{" "}
                <strong>
                  {clusterData.property?.name || "Unknown Property"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchClusterData}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <FaSync
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Cluster Info */}
        {clusterData.description && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Deskripsi</h3>
            <p className="text-gray-600">{clusterData.description}</p>
          </div>
        )}

        {/* Gallery */}
        {clusterData.gallery && clusterData.gallery.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Galeri Cluster ({clusterData.gallery.length} foto)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {clusterData.gallery.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] bg-gray-100 rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <Image
                    src={image.src || image.url}
                    alt={
                      image.alt ||
                      `Cluster ${clusterData.name} - Foto ${index + 1}`
                    }
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Overlay dengan nomor gambar */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-end justify-start p-2">
                    <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {index + 1} / {clusterData.gallery.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unit Types Management */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FaHome className="mr-3 text-green-600" />
              Manajemen Tipe Unit
            </h2>
            <p className="text-gray-600 mt-1">
              Kelola tipe unit untuk cluster <strong>{clusterData.name}</strong>
            </p>
          </div>

          <Link
            href={`/admin/units/add?clusterId=${clusterId}`}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Tambah Tipe Unit
          </Link>
        </div>

        {/* Loading State untuk Refresh */}
        {isRefreshing && (
          <div className="text-center py-4 mb-4">
            <FaSpinner className="animate-spin text-blue-500 text-xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Memuat data tipe unit...</p>
          </div>
        )}

        {/* Daftar Unit Types */}
        {units.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FaHome className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">
              Belum ada tipe unit untuk cluster ini.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Klik tombol &quot;Tambah Tipe Unit&quot; untuk mulai menambahkan
              tipe unit.
            </p>
            <Link
              href={`/admin/units/add?clusterId=${clusterId}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Tambah Tipe Unit Pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit._id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                {/* Unit Header */}
                <div className="mb-4">
                  <h4 className="font-bold text-lg text-gray-800 mb-1">
                    {unit.name}
                  </h4>
                  <p className="text-blue-600 font-semibold text-lg">
                    Rp {Number(unit.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* Unit Specs */}
                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <FaBed className="text-gray-400" />
                    <span>{unit.bedrooms || 0} Kamar Tidur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBath className="text-gray-400" />
                    <span>{unit.bathrooms || 0} Kamar Mandi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaRulerCombined className="text-gray-400" />
                    <span>
                      LT: {unit.landSize || 0} m² | LB: {unit.buildingSize || 0}{" "}
                      m²
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCar className="text-gray-400" />
                    <span>{unit.carport || 0} Carport</span>
                  </div>
                </div>

                {/* Unit Gallery Info */}
                {unit.gallery && unit.gallery.length > 0 && (
                  <div className="text-xs text-gray-400 mb-4">
                    📸 {unit.gallery.length} foto
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/admin/units/${unit._id}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    title="Lihat Detail Unit"
                  >
                    <FaEye className="mr-1" />
                    Detail
                  </Link>

                  <Link
                    href={`/admin/units/edit/${unit._id}`}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                    title="Edit Unit"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDeleteUnit(unit._id, unit.name)}
                    className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    title="Hapus Unit"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {units.length > 0 && !isRefreshing && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="font-semibold text-blue-600">
                  {units.length}
                </div>
                <div className="text-blue-500">Total Tipe Unit</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="font-semibold text-green-600">
                  Rp{" "}
                  {Math.min(...units.map((u) => u.price || 0)).toLocaleString(
                    "id-ID"
                  )}
                </div>
                <div className="text-green-500">Harga Terendah</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="font-semibold text-purple-600">
                  Rp{" "}
                  {Math.max(...units.map((u) => u.price || 0)).toLocaleString(
                    "id-ID"
                  )}
                </div>
                <div className="text-purple-500">Harga Tertinggi</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="font-semibold text-yellow-600">
                  {units.reduce(
                    (total, unit) => total + (unit.gallery?.length || 0),
                    0
                  )}
                </div>
                <div className="text-yellow-500">Total Foto</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
