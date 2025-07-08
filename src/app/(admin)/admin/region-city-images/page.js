"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useNotification from "@/hooks/useNotification";
import { FaPlus, FaEdit, FaTrash, FaImage, FaGlobe, FaCity } from "react-icons/fa";
import Image from "next/image";
import Swal from "sweetalert2";

export default function RegionCityImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "region", "city"
  const [selectedRegion, setSelectedRegion] = useState("");
  const router = useRouter();
  const notify = useNotification();

  // Fetch data
  const fetchImages = async () => {
    try {
      setLoading(true);
      let url = "/api/region-city-images";
      const params = new URLSearchParams();
      
      if (filter !== "all") {
        params.append("type", filter);
      }
      if (selectedRegion && filter === "city") {
        params.append("parentRegion", selectedRegion);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setImages(data.images);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      notify.error("Gagal memuat data gambar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedRegion]);

  // Delete handler
  const handleDelete = async (id, name, type) => {
    const result = await Swal.fire({
      title: "Hapus Gambar?",
      text: `Yakin ingin menghapus ${type === "region" ? "region" : "kota"} "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/region-city-images/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (data.success) {
          notify.success(data.message);
          fetchImages();
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
        notify.error("Gagal menghapus gambar");
      }
    }
  };

  // Get unique regions for filter
  const regions = [...new Set(
    images
      .filter(img => img.type === "region")
      .map(img => img.name)
  )];

  const filteredImages = images.filter(img => {
    if (filter === "all") return true;
    if (filter === "region") return img.type === "region";
    if (filter === "city") {
      if (selectedRegion) return img.type === "city" && img.parentRegion === selectedRegion;
      return img.type === "city";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kelola Gambar Region & Kota</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Gambar Region & Kota</h1>
        <button
          onClick={() => router.push("/admin/region-city-images/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus size={16} />
          Tambah Gambar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Tipe:
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setSelectedRegion("");
              }}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Semua</option>
              <option value="region">Region</option>
              <option value="city">Kota</option>
            </select>
          </div>

          {filter === "city" && regions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter Region:
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Semua Region</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FaGlobe size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Region</p>
              <p className="text-xl font-bold text-blue-600">
                {images.filter(img => img.type === "region").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <FaCity size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Kota</p>
              <p className="text-xl font-bold text-green-600">
                {images.filter(img => img.type === "city").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 text-white p-2 rounded-lg">
              <FaImage size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gambar</p>
              <p className="text-xl font-bold text-purple-600">
                {images.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <FaImage size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada gambar</p>
          <p className="text-gray-400 text-sm mb-4">
            Tambahkan gambar region atau kota untuk mulai mengelola
          </p>
          <button
            onClick={() => router.push("/admin/region-city-images/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tambah Gambar Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image) => (
            <div key={image._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={image.image.src}
                  alt={image.image.alt}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    image.type === "region" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {image.type === "region" ? "Region" : "Kota"}
                  </span>
                </div>
                {!image.isActive && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Nonaktif
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{image.name}</h3>
                {image.type === "city" && (
                  <p className="text-sm text-gray-600 mb-2">Region: {image.parentRegion}</p>
                )}
                <p className="text-xs text-gray-500 mb-3">
                  Dibuat: {new Date(image.createdAt).toLocaleDateString("id-ID")}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/region-city-images/edit/${image._id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <FaEdit size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image._id, image.name, image.type)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                  >
                    <FaTrash size={12} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
