"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import useNotification from "@/hooks/useNotification";
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
  FaFilter,
  FaSort,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaTh,
  FaList,
  FaCheck,
} from "react-icons/fa";
import Swal from "sweetalert2";
import BulkActions from "./BulkActions";
import ListSkeleton from "./ListSkeleton";
import StatsSkeleton from "./StatsSkeleton";
import SearchFilterSkeleton from "./SearchFilterSkeleton";
import PageHeaderSkeleton from "./PageHeaderSkeleton";

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
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  const notify = useNotification();

  async function fetchData() {
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
      notify.error(error.message || "Gagal mengambil data properti");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [assetType, apiEndpoint]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      html: `Apakah Anda yakin ingin menghapus properti <strong>"${name}"</strong>?<br><small class="text-gray-500">Tindakan ini tidak dapat dibatalkan</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiEndpoint}/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // Use notification system for success message
          notify.success("Properti berhasil dihapus");
          fetchData();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        notify.error("Gagal menghapus properti");
      }
    }
  };

  // Bulk Actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(currentItems.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = async (itemIds) => {
    for (const id of itemIds) {
      await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
    }
    setSelectedItems([]);
    fetchData();
  };

  const handleBulkStatusChange = async (itemIds, newStatus) => {
    for (const id of itemIds) {
      await fetch(`${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingStatus: newStatus }),
      });
    }
    setSelectedItems([]);
    fetchData();
  };

  const handleExport = (itemIds) => {
    const dataToExport = properties.filter(p => itemIds.includes(p._id));
    const csvContent = [
      ["Nama", "Developer", "Harga", "Lokasi", "Status", "Tanggal Dibuat"],
      ...dataToExport.map(p => [
        p.name,
        p.developer,
        p.startPrice,
        `${p.location?.area}, ${p.location?.city}`,
        p.listingStatus?.name,
        new Date(p.createdAt).toLocaleDateString('id-ID')
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `properti-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Memoized calculations for better performance
  const filteredAndSortedData = useMemo(() => {
    let filtered = properties.filter((p) => {
      const matchesSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location?.city || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === "ALL") return matchesSearch;
      return matchesSearch && p.listingStatus?.name === filterStatus;
    });

    return filtered.sort((a, b) => {
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
      } else if (sortBy === "createdAt") {
        valueA = new Date(a.createdAt || 0);
        valueB = new Date(b.createdAt || 0);
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
  }, [properties, searchTerm, filterStatus, sortBy, sortOrder]);

  const getStatusCount = useCallback((statusName) => {
    return properties.filter((p) => p.listingStatus?.name === statusName).length;
  }, [properties]);

  const statsData = useMemo(() => [
    {
      title: "Total Properti",
      value: properties.length,
      icon: FaBuilding,
      color: "blue",
      description: "Semua properti"
    },
    {
      title: "Dijual",
      value: getStatusCount("Dijual"),
      icon: FaHome,
      color: "green",
      description: "Properti dijual"
    },
    {
      title: "Disewakan",
      value: getStatusCount("Disewakan"),
      icon: FaHome,
      color: "purple",
      description: "Properti disewa"
    },
    {
      title: "Terjual Habis",
      value: getStatusCount("Terjual Habis"),
      icon: FaHome,
      color: "red",
      description: "Properti habis"
    }
  ], [properties.length, getStatusCount]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "Dijual": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      "Disewakan": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "Terjual Habis": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      "Segera Hadir": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    };
    
    const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.text} ${config.border}`}>
        {status || "N/A"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">
                Kelola dan pantau {assetType?.toLowerCase() || 'properti'} Anda dengan mudah
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'table' ? <FaTh /> : <FaList />}
                {viewMode === 'table' ? 'Grid View' : 'Table View'}
              </button>
              <button 
                onClick={() => handleExport(selectedItems.length > 0 ? selectedItems : properties.map(p => p._id))}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaDownload />
                Export {selectedItems.length > 0 ? `(${selectedItems.length})` : 'Semua'}
              </button>
              <Link
                href={addUrl}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus />
                Tambah Properti
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {loading ? (
        <StatsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = {
              blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
              green: { bg: "bg-green-50", icon: "text-green-600", border: "border-green-100" },
              purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
              red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-100" },
            };
            const colors = colorClasses[stat.color];
            
            return (
              <div key={index} className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`${colors.bg} p-3 rounded-lg`}>
                    <IconComponent className={`${colors.icon} text-xl`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Filters */}
      {loading ? (
        <SearchFilterSkeleton showExpandedFilters={showFilters} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama properti, developer, atau lokasi..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter />
                Filter
              </button>

              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10 per halaman</option>
                <option value={25}>25 per halaman</option>
                <option value={50}>50 per halaman</option>
                <option value={100}>100 per halaman</option>
              </select>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Listing
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Nama Properti</option>
                    <option value="price">Harga</option>
                    <option value="location">Lokasi</option>
                    <option value="createdAt">Tanggal Dibuat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutan
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="asc">A-Z / Terendah</option>
                    <option value="desc">Z-A / Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <ListSkeleton viewMode={viewMode} itemsPerPage={itemsPerPage} />
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <FaBuilding className="text-gray-300 text-5xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filteredAndSortedData.length === 0 ? 'Belum ada data properti' : 'Tidak ada hasil yang sesuai'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filteredAndSortedData.length === 0 
                ? `Mulai tambahkan ${assetType?.toLowerCase() || 'properti'} pertama Anda` 
                : 'Coba ubah filter atau kata kunci pencarian'
              }
            </p>
            {filteredAndSortedData.length === 0 ? (
              <Link
                href={addUrl}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus />
                Tambah Properti Baru
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("ALL");
                  setShowFilters(false);
                }}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Results Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> - 
                <span className="font-semibold">{Math.min(indexOfLastItem, filteredAndSortedData.length)}</span> dari 
                <span className="font-semibold"> {filteredAndSortedData.length}</span> properti
              </div>
              <div className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          if (sortBy === 'name') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('name');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Properti
                        <FaSort className="text-xs" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Developer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          if (sortBy === 'price') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('price');
                            setSortOrder('desc');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Harga
                        <FaSort className="text-xs" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          if (sortBy === 'location') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('location');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Lokasi
                        <FaSort className="text-xs" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          if (sortBy === 'createdAt') {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy('createdAt');
                            setSortOrder('desc');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Dibuat
                        <FaSort className="text-xs" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((property) => (
                    <tr key={property._id} className={`hover:bg-gray-50 transition-colors ${selectedItems.includes(property._id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(property._id)}
                          onChange={(e) => handleSelectItem(property._id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <FaBuilding className="text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {property._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{property.developer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(property.startPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FaMapMarkerAlt className="text-gray-400 mr-1" />
                          {property.location?.area}, {property.location?.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(property.listingStatus?.name)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-1" />
                          {formatDate(property.createdAt)}
                        </div>
                        <div className="text-xs text-gray-400">
                          oleh {property.createdBy?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`${detailUrl}/${property._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Lihat Detail"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`${editUrl}/${property._id}`}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(property._id, property.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Grid View
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((property) => (
                  <div key={property._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <div className="flex items-center justify-center h-48">
                        <FaBuilding className="text-gray-400 text-4xl" />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {property.name}
                        </h3>
                        {getStatusBadge(property.listingStatus?.name)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{property.developer}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <FaMapMarkerAlt className="mr-1" />
                        {property.location?.area}, {property.location?.city}
                      </div>
                      <div className="text-lg font-bold text-blue-600 mb-3">
                        {formatPrice(property.startPrice)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {formatDate(property.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`${detailUrl}/${property._id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            href={`${editUrl}/${property._id}`}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(property._id, property.name)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Total: <span className="font-semibold">{filteredAndSortedData.length}</span> properti
                </div>
                
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <FaChevronLeft />
                    Sebelumnya
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="dots1" className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              currentPage === i
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="dots2" className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Selanjutnya
                    <FaChevronRight />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedItems}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onExport={handleExport}
      />
    </div>
  );
}
