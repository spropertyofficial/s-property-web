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
  FaTag,
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";

export default function PropertyDetailPage({
  propertyType = "properties",
  apiEndpoint = "/api/properties",
  listUrl = "/admin/properties",
  editUrl = "/admin/properties/edit",
  clustersUrl = "/admin/clusters",
  title = "Properti",
}) {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        console.log("Fetching property with ID:", id);
        const res = await fetch(`${apiEndpoint}/${id}`);
        console.log("Response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal mengambil data properti");
        }

        const data = await res.json();
        console.log("Received data:", data);
        setProperty(data.property || data);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, apiEndpoint]);

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
          const res = await fetch(`${apiEndpoint}/${id}`, {
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
            router.push(listUrl);
          });
        } catch (err) {
          console.error("Error deleting property:", err);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getStatusDisplay = (listingStatus, propertyStatus) => {
    // Prioritas: gunakan listingStatus jika ada, fallback ke propertyStatus
    const status = listingStatus?.name || propertyStatus;

    if (!status) return { text: "N/A", className: "bg-gray-100 text-gray-800" };

    const statusLower = status.toLowerCase();

    if (statusLower.includes("jual") && !statusLower.includes("terjual")) {
      return { text: status, className: "bg-green-100 text-green-800" };
    } else if (statusLower.includes("sewa")) {
      return { text: status, className: "bg-blue-100 text-blue-800" };
    } else if (
      statusLower.includes("terjual") ||
      statusLower.includes("habis")
    ) {
      return { text: status, className: "bg-red-100 text-red-800" };
    } else if (statusLower.includes("segera") || statusLower.includes("soon")) {
      return { text: status, className: "bg-yellow-100 text-yellow-800" };
    } else {
      return { text: status, className: "bg-gray-100 text-gray-800" };
    }
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

  if (!property) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>Properti tidak ditemukan</p>
          <button
            onClick={() => router.push(listUrl)}
            className="mt-2 text-sm underline"
          >
            Kembali ke Daftar Properti
          </button>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(
    property.listingStatus,
    property.propertyStatus
  );

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
          <div>
            <h1 className="text-2xl font-bold">{property.name}</h1>
            <p className="text-gray-500">Detail {title}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`${editUrl}/${id}`}
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
            {property.gallery && property.gallery.length > 0 ? (
              <Image
                src={
                  property.gallery[activeImageIndex]?.src ||
                  property.gallery[activeImageIndex]?.url ||
                  "/images/placeholder.jpg"
                }
                alt={
                  property.gallery[activeImageIndex]?.alt ||
                  property.gallery[activeImageIndex]?.name ||
                  property.name
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
          {property.gallery && property.gallery.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {property.gallery.map((image, index) => (
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
                    src={image.src || image.url}
                    alt={
                      image.alt || image.name || `Gallery image ${index + 1}`
                    }
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
              <p className="font-medium">{property.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Developer</p>
              <p className="font-medium">{property.developer || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Harga Mulai Dari</p>
              <p className="font-medium text-lg">
                Rp {Number(property.startPrice || 0).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              {property.assetType && (
                <div>
                  <p className="text-gray-500 text-sm">Tipe Aset</p>
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {property.assetType.name || property.assetType}
                  </span>
                </div>
              )}

              {property.marketStatus && (
                <div>
                  <p className="text-gray-500 text-sm">Status Pasar</p>
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                    {property.marketStatus.name || property.marketStatus}
                  </span>
                </div>
              )}

              <div>
                <p className="text-gray-500 text-sm">Status Ketersediaan</p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusDisplay.className}`}
                >
                  {statusDisplay.text}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Lokasi</p>
              <div className="flex items-start mt-1">
                <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                <p>
                  {property.location?.area && `${property.location.area}, `}
                  {property.location?.city && `${property.location.city}, `}
                  {property.location?.region && `${property.location.region}, `}
                  {property.location?.country || "Indonesia"}
                </p>
              </div>
              {property.location?.address && (
                <p className="text-sm text-gray-500 mt-1 ml-6">
                  {property.location.address}
                </p>
              )}
              {property.location?.mapsLink &&
                property.location.mapsLink !== "-" && (
                  <a
                    href={property.location.mapsLink}
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
                href={`${clustersUrl}/new?property=${id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                + Tambah Cluster
              </Link>
            </div>

            {property.clusters && property.clusters.length > 0 ? (
              <div className="space-y-3">
                {property.clusters.map((cluster, index) => (
                  <Link
                    key={index}
                    href={`${clustersUrl}/${
                      typeof cluster === "object" ? cluster._id : cluster
                    }`}
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FaHome className="text-gray-400 mr-3" />
                    <span>
                      {typeof cluster === "object" ? cluster.name : cluster}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Belum ada cluster yang ditambahkan
              </p>
            )}
          </div>

          <hr className="my-6" />

          {/* Metadata */}
          <div>
            <h3 className="font-semibold mb-3">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <FaUser className="text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-500">Dibuat oleh</p>
                  <p>{property.createdBy?.name || "-"}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaCalendarAlt className="text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-500">Tanggal dibuat</p>
                  <p>{formatDate(property.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FaEdit className="text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-500">Terakhir diubah</p>
                  <p>{property.updatedBy?.name || "-"}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(property.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FaTag className="text-gray-400 mr-2" />
                <div>
                  <p className="text-gray-500">ID Database</p>
                  <p className="font-mono text-xs break-all">
                    {property._id || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBuilding className="mr-2" /> Tentang Properti
          </h2>

          {property.description ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          ) : (
            <p className="text-gray-500 italic">Belum ada deskripsi properti</p>
          )}
        </div>
      </div>
    </div>
  );
}
