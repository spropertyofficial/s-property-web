"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function PropertyListPage({
  assetType,
  title,
  addUrl = "/admin/properties/add",
  editUrl = "/admin/properties/edit",
  detailUrl = "/admin/properties",
  apiEndpoint = "/api/properties",
}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [assetType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = assetType
        ? `${apiEndpoint}?assetType=${encodeURIComponent(assetType)}`
        : apiEndpoint;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      const data = await res.json();
      console.log("Fetched properties:", data);
      setProperties(data.properties || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Gagal mengambil data properti",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus properti "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${apiEndpoint}/${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            Swal.fire("Terhapus!", "Properti berhasil dihapus.", "success");
            fetchData();
          } else {
            throw new Error("Failed to delete");
          }
        } catch (error) {
          Swal.fire("Error!", "Gagal menghapus properti.", "error");
        }
      }
    });
  };

  // Filter and sort the data
  const filteredData = properties.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location?.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;

    // Sekarang kita memfilter berdasarkan nama dari listingStatus
    return matchesSearch && p.listingStatus?.name === filterStatus;
  });

  const getStatusCount = (statusName) => {
    // Menghitung statistik juga berdasarkan nama
    return properties.filter((p) => p.listingStatus?.name === statusName)
      .length;
  };

  const sortedData = [...filteredData].sort((a, b) => {
    let valueA, valueB;

    if (sortBy === "name") {
      valueA = a.name?.toLowerCase() || "";
      valueB = b.name?.toLowerCase() || "";
    } else if (sortBy === "price") {
      valueA = a.startPrice || 0;
      valueB = b.startPrice || 0;
    } else if (sortBy === "location") {
      valueA = (a.location?.city || "").toLowerCase();
      valueB = (b.location?.city || "").toLowerCase();
    } else {
      valueA = a[sortBy] || "";
      valueB = b[sortBy] || "";
    }

    if (sortOrder === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-500">{title}</h1>
          <Link
            href={addUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FaPlus /> Tambah Properti
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <FaHome className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-300 text-sm">Total Properti</p>
              <h3 className="text-2xl font-bold text-gray-500">
                {properties.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <FaHome className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-300 text-sm">Properti Dijual</p>
              <h3 className="text-2xl font-bold text-gray-500">
                {getStatusCount("dijual")}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <FaHome className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-300 text-sm">Properti Disewa</p>
              <h3 className="text-2xl font-bold text-gray-500">
                {getStatusCount("disewa")}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari properti..."
                className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-300" />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Items per page selector */}
            <div className="w-fit">
              <select
                className="w-full p-2 border border-gray-100 rounded"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset ke halaman pertama
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="w-48">
              <select
                className="w-full p-2 border border-gray-100 rounded"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="Dijual">Dijual</option>
                <option value="Disewakan">Disewakan</option>
                <option value="Terjual Habis">Terjual Habis</option>
                <option value="Segera Hadir">Segera Hadir</option>
              </select>
            </div>

            <div className="w-48">
              <select
                className="w-full p-2 border border-gray-100 rounded"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
              >
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="price-asc">Harga (Terendah)</option>
                <option value="price-desc">Harga (Tertinggi)</option>
                <option value="location-asc">Lokasi (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <FaHome className="text-gray-200 text-5xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            Tidak ada data properti yang sesuai dengan filter.
          </p>
          {searchTerm || filterStatus !== "ALL" ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("ALL");
              }}
              className="mt-4 text-blue-600 hover:underline"
            >
              Reset filter
            </button>
          ) : (
            <Link
              href={addUrl}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tambah Properti Baru
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-500">
              Menampilkan {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, sortedData.length)} dari{" "}
              {sortedData.length} data
            </div>
            <div className="text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </div>
          </div>
          <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 table-fixed">
              <thead>
                <tr>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nama Properti
                  </th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Harga Mulai
                  </th>
                  <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Dibuat Oleh
                  </th>
                  <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Diubah Oleh
                  </th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentItems.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-500">
                        {property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 truncate">
                        {property.developer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        Rp {property.startPrice?.toLocaleString() || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {property.location?.area}, {property.location?.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        property.listingStatus?.name === "Dijual"
                          ? "bg-green-100 text-green-800"
                          : property.listingStatus?.name === "Disewakan"
                          ? "bg-blue-100 text-blue-800"
                          : property.listingStatus?.name === "Terjual Habis"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      >
                        {property.listingStatus?.name || "N/A"}
                      </span>{" "}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{property.createdBy?.name || "-"}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(property.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{property.updatedBy?.name || "-"}</div>
                      <div className="text-xs text-gray-400">
                        {formatDate(property.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`${detailUrl}/${property._id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Detail"
                        >
                          <FaEye className="text-lg" />
                        </Link>

                        <Link
                          href={`${editUrl}/${property._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit className="text-lg" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(property._id, property.name)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Total: {sortedData.length} properti
              </div>

              <nav className="flex items-center gap-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  &laquo; Sebelumnya
                </button>

                {/* Page numbers dengan smart pagination */}
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let startPage = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2)
                  );
                  let endPage = Math.min(
                    totalPages,
                    startPage + maxVisible - 1
                  );

                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => paginate(1)}
                        className="px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="dots1" className="px-2">
                          ...
                        </span>
                      );
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i
                            ? "bg-blue-600 text-white"
                            : "text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="dots2" className="px-2">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => paginate(totalPages)}
                        className="px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Selanjutnya &raquo;
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
