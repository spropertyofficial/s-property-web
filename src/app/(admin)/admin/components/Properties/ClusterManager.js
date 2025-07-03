"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FaPlus,
  FaTrash,
  FaSpinner,
  FaEdit,
  FaEye,
  FaLayerGroup,
  FaSync,
} from "react-icons/fa";
import Link from "next/link";
import ClusterForm from "../../clusters/components/ClusterForm";

export default function ClusterManager({
  propertyId,
  propertyName,
  initialClusters = [],
  assetType,
}) {
  const [clusters, setClusters] = useState(initialClusters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null); // State untuk cluster yang sedang diedit

  // Update clusters jika props berubah
  useEffect(() => {
    setClusters(initialClusters);
  }, [initialClusters]);

  // Fungsi untuk fetch ulang data clusters
  const fetchClusters = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/clusters?propertyId=${propertyId}`);
      const data = await res.json();
      if (res.ok) {
        setClusters(data.clusters || []);
      } else {
        throw new Error(data.error || "Gagal mengambil data clusters");
      }
    } catch (error) {
      console.error("Error fetching clusters:", error);
      Swal.fire(
        "Error",
        "Gagal memuat data clusters: " + error.message,
        "error"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handler untuk menambah cluster baru
  const handleAddCluster = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          gallery: formData.gallery,
          propertyId: propertyId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan cluster");

      Swal.fire({
        title: "Berhasil!",
        text: "Cluster baru berhasil ditambahkan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowAddForm(false);

      // Fetch ulang data clusters
      await fetchClusters();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk menghapus cluster
  const handleDeleteCluster = async (clusterId, clusterName) => {
    Swal.fire({
      title: "Anda yakin?",
      text: `Cluster "${clusterName}" dan semua tipe unit di dalamnya akan dihapus!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Tampilkan loading state
          Swal.fire({
            title: "Menghapus...",
            text: "Sedang menghapus cluster",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const res = await fetch(`/api/clusters/${clusterId}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          Swal.fire({
            title: "Terhapus!",
            text: data.message,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          // Fetch ulang data clusters
          await fetchClusters();
        } catch (error) {
          Swal.fire("Gagal", error.message, "error");
        }
      }
    });
  };

  // Handler untuk edit cluster
  const handleEditCluster = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/clusters/${editingCluster._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          gallery: formData.gallery,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui cluster");

      Swal.fire({
        title: "Berhasil!",
        text: "Cluster berhasil diperbarui.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditingCluster(null);

      // Fetch ulang data clusters
      await fetchClusters();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (cluster) => {
    setEditingCluster(cluster);
    setShowAddForm(false); // Tutup form add jika sedang buka
  };

  const cancelEdit = () => {
    setEditingCluster(null);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <div className="mt-8">
      <section className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FaLayerGroup className="mr-3 text-blue-600" />
              Manajemen Cluster
            </h2>
            <p className="text-gray-600 mt-1">
              Kelola cluster untuk properti <strong>{propertyName}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchClusters}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <FaSync
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={toggleAddForm}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                showAddForm
                  ? "bg-gray-500 text-white hover:bg-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {showAddForm ? (
                <>
                  <FaSpinner className="mr-2" />
                  Batal
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Tambah Cluster
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Tambah Cluster - Conditional Rendering */}
        {showAddForm && !editingCluster && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-4">Tambah Cluster Baru</h3>
            <ClusterForm
              onSubmit={handleAddCluster}
              isEditing={false}
              isSubmitting={isSubmitting}
              propertyInfo={{
                assetType: assetType,
                propertyName: propertyName,
                propertyId: propertyId,
              }}
              showHeader={false}
              showBackButton={false}
            />
          </div>
        )}

        {/* Form Edit Cluster */}
        {editingCluster && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Edit Cluster: {editingCluster.name}
              </h3>
              <button
                onClick={cancelEdit}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Batal Edit
              </button>
            </div>
            <ClusterForm
              initialData={editingCluster}
              onSubmit={handleEditCluster}
              isEditing={true}
              isSubmitting={isSubmitting}
              propertyInfo={{
                assetType: assetType,
                propertyName: propertyName,
                propertyId: propertyId,
              }}
              showHeader={false}
              showBackButton={false}
            />
          </div>
        )}

        {/* Loading State untuk Refresh */}
        {isRefreshing && (
          <div className="text-center py-4 mb-4">
            <FaSpinner className="animate-spin text-blue-500 text-xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Memuat data clusters...</p>
          </div>
        )}

        {/* Daftar Cluster yang Sudah Ada */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Daftar Cluster Existing</h3>
            <span className="text-sm text-gray-500">
              {clusters.length} cluster terdaftar
            </span>
          </div>

          {clusters.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FaLayerGroup className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 mb-2">
                Belum ada cluster untuk properti ini.
              </p>
              <p className="text-sm text-gray-400">
                Klik tombol &quot;Tambah Cluster&quot; untuk mulai menambahkan
                cluster.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusters.map((cluster) => (
                <div
                  key={cluster._id}
                  className={`p-4 bg-white border rounded-lg hover:shadow-md transition-all duration-200 ${
                    editingCluster?._id === cluster._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  {/* Cluster Header */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {cluster.name}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {cluster.description || "Tidak ada deskripsi"}
                    </p>
                  </div>

                  {/* Cluster Stats */}
                  <div className="mb-3 text-xs text-gray-400">
                    <span className="inline-block mr-3">
                      🏠 {cluster.units?.length || 0} unit types
                    </span>
                    <span className="inline-block">
                      📸 {cluster.gallery?.length || 0} foto
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/admin/clusters/${cluster._id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      title="Lihat Detail & Kelola Unit"
                    >
                      <FaEye className="mr-1" />
                      Detail
                    </Link>

                    <button
                      onClick={() => startEdit(cluster)}
                      disabled={
                        editingCluster?._id === cluster._id || isSubmitting
                      }
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
                      title="Edit Cluster"
                    >
                      <FaEdit className="mr-1" />
                      {editingCluster?._id === cluster._id
                        ? "Editing..."
                        : "Edit"}
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteCluster(cluster._id, cluster.name)
                      }
                      disabled={
                        editingCluster?._id === cluster._id || isSubmitting
                      }
                      className="flex items-center justify-center px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                      title="Hapus Cluster"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {clusters.length > 0 && !isRefreshing && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="font-semibold text-blue-600">
                  {clusters.length}
                </div>
                <div className="text-blue-500">Total Cluster</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="font-semibold text-green-600">
                  {clusters.reduce(
                    (total, cluster) => total + (cluster.units?.length || 0),
                    0
                  )}
                </div>
                <div className="text-green-500">Total Unit Types</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="font-semibold text-purple-600">
                  {clusters.reduce(
                    (total, cluster) => total + (cluster.gallery?.length || 0),
                    0
                  )}
                </div>
                <div className="text-purple-500">Total Foto</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
