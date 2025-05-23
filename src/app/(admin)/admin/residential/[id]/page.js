"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaBuilding,
  FaLayerGroup,
  FaHome,
} from "react-icons/fa";

export default function ResidentialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [residential, setResidential] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchResidential = async () => {
      try {
        setLoading(true);
        console.log("Fetching residential with ID:", id);
        const res = await fetch(`/api/residential/${id}`);
        console.log("Response status:", res);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal mengambil data properti");
        }

        const data = await res.json();
        console.log("Received data:", data);
        setResidential(data);
      } catch (err) {
        console.error("Error fetching residential:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResidential();
    }
  }, [id]);

  const handleDelete = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data properti ini akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/residential/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            throw new Error("Gagal menghapus properti");
          }

          Swal.fire({
            title: "Berhasil!",
            text: "Properti telah dihapus.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            router.push("/admin/residential");
          });
        } catch (err) {
          console.error("Error deleting residential:", err);
          Swal.fire({
            title: "Error!",
            text: err.message || "Terjadi kesalahan saat menghapus data",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 animate-pulse rounded"
                ></div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-gray-200 animate-pulse rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-sm underline"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!residential) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Properti tidak ditemukan</p>
          <button
            onClick={() => router.push("/admin/residential")}
            className="mt-2 text-sm underline"
          >
            Kembali ke Daftar Properti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">{residential.name}</h1>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/admin/residential/${id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaEdit className="mr-2" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FaTrash className="mr-2" /> Hapus
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery */}
        <div className="lg:col-span-2">
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
            {residential.gallery && residential.gallery.length > 0 ? (
              <Image
                src={
                  residential.gallery[activeImageIndex]?.src ||
                  "/images/placeholder.jpg"
                }
                alt={
                  residential.gallery[activeImageIndex]?.alt || residential.name
                }
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <p className="text-gray-500">Tidak ada gambar</p>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {residential.gallery && residential.gallery.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {residential.gallery.map((image, index) => (
                <div
                  key={index}
                  className={`relative h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                    index === activeImageIndex
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt || `Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">Informasi Properti</h2>

          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-sm">Nama Properti</p>
              <p className="font-medium">{residential.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Developer</p>
              <p className="font-medium">{residential.developer}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Harga Mulai Dari</p>
              <p className="font-medium text-lg">
                Rp {Number(residential.startPrice).toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    residential.propertyStatus === "SALE"
                      ? "bg-green-100 text-green-800"
                      : residential.propertyStatus === "SOLD"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {residential.propertyStatus === "SALE"
                    ? "Dijual"
                    : residential.propertyStatus === "SOLD"
                    ? "Terjual Habis"
                    : residential.propertyStatus === "COMING_SOON"
                    ? "Segera Hadir"
                    : residential.propertyStatus}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Lokasi</p>
              <div className="flex items-start mt-1">
                <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                <p>
                  {residential.location?.area &&
                    `${residential.location.area}, `}
                  {residential.location?.city &&
                    `${residential.location.city}, `}
                  {residential.location?.region &&
                    `${residential.location.region}, `}
                  {residential.location?.country || "Indonesia"}
                </p>
              </div>
              {residential.location?.address && (
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  {residential.location.address}
                </p>
              )}
              {residential.location?.mapsLink &&
                residential.location.mapsLink !== "-" && (
                  <a
                    href={residential.location.mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 ml-6 inline-block"
                  >
                    Lihat di Google Maps
                  </a>
                )}
            </div>
          </div>

          <hr className="my-6" />

          {/* Clusters */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center">
                <FaLayerGroup className="mr-2" /> Clusters
              </h3>
              <Link
                href={`/admin/clusters/new?residential=${id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                + Tambah Cluster
              </Link>
            </div>

            {residential.clusters && residential.clusters.length > 0 ? (
              <div className="space-y-3">
                {residential.clusters.map((clusterId, index) => (
                  <Link
                    key={index}
                    href={`/admin/clusters/${clusterId}`}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FaHome className="text-gray-400 mr-3" />
                    <span>{clusterId}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Belum ada cluster yang ditambahkan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBuilding className="mr-2" /> Tentang Properti
          </h2>

          {residential.description ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: residential.description }}
            />
          ) : (
            <p className="text-gray-500 italic">Belum ada deskripsi properti</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Metadata</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-500">Tanggal Dibuat:</p>
              <p>
                {residential.createdAt
                  ? new Date(residential.createdAt).toLocaleDateString("id-ID")
                  : "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-500">Terakhir Diupdate:</p>
              <p>
                {residential.updatedAt
                  ? new Date(residential.updatedAt).toLocaleDateString("id-ID")
                  : "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-500">ID Database:</p>
              <p className="font-mono text-sm">{residential._id || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
