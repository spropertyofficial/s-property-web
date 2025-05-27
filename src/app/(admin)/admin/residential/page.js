"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBuilding,
  FaLayerGroup,
  FaDoorOpen,
  FaTachometerAlt,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function AdminDashboard() {
  const [residentials, setResidentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const itemsPerPage = 6;
  const pathname = usePathname();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/residential");
      const data = await res.json();
      setResidentials(data.residentials || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "Gagal mengambil data properti",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#131414",
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
          const res = await fetch(`/api/residential/${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            Swal.fire("Terhapus!", "Properti berhasil dihapus.", "success");
            fetchData();
          } else {
            throw new Error("Failed to delete");
          }
        } catch (error) {
          Swal.fire("Error!", "Gagal menghapus properti.", error);
        }
      }
    });
  };

  // Filter and sort the data
  const filteredData = residentials.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.location?.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    return matchesSearch && r.propertyStatus === filterStatus;
  });

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

  // Sidebar navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Residentials",
      path: "/admin/residential",
      icon: <FaBuilding />,
    },
    {
      name: "Clusters",
      path: "/admin/clusters",
      icon: <FaLayerGroup />,
    },
    {
      name: "Unit Types",
      path: "/admin/types",
      icon: <FaDoorOpen />,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-500">
            Residential Properties
          </h1>
          <Link
            href="/admin/residential/new"
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
                {residentials.length}
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
                {residentials.filter((r) => r.propertyStatus === "SALE").length}
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
                {residentials.filter((r) => r.propertyStatus === "RENT").length}
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
            <div className="w-48">
              <select
                className="w-full p-2 border border-gray-100 rounded"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">Semua Status</option>
                <option value="SALE">Dijual</option>
                <option value="RENT">Disewa</option>
                <option value="SOLD">Terjual</option>
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
              href="/admin/residential/new"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
            >
              Tambah Properti Baru
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nama Properti
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Harga Mulai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentItems.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-500">
                        {r.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{r.developer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        Rp{r.startPrice?.toLocaleString() || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {r.location?.area}, {r.location?.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              r.propertyStatus === "SALE"
                                ? "bg-green-100 text-green-800"
                                : r.propertyStatus === "RENT"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                      >
                        {r.propertyStatus === "SALE"
                          ? "Dijual"
                          : r.propertyStatus === "RENT"
                          ? "Disewa"
                          : r.propertyStatus === "SOLD"
                          ? "Terjual"
                          : r.propertyStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/residential/${r._id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Detail"
                        >
                          <FaEye className="text-lg" />
                        </Link>

                        <Link
                          href={`/admin/residential/${r._id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit className="text-lg" />
                        </Link>
                        <button
                          onClick={() => handleDelete(r._id, r.name)}
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
            <div className="flex justify-center mt-6">
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
                  &laquo;
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

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
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
