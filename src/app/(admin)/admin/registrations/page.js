"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  FaEye, 
  FaDownload, 
  FaFilter, 
  FaSearch, 
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaUsers,
  FaTrash,
  FaSync
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useAdmin } from "@/hooks/useAdmin";

export default function RegistrationsPage() {
  const { admin } = useAdmin();
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [autoReload, setAutoReload] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const applyFilters = useCallback(() => {
    let filtered = [...registrations];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(reg => reg.status === filters.status);
    }

    // Filter by search (name, email, phone)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.personalData.fullName.toLowerCase().includes(searchLower) ||
        reg.personalData.email.toLowerCase().includes(searchLower) ||
        reg.personalData.phone.includes(filters.search)
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(reg => {
        const regDate = new Date(reg.submittedAt);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        return regDate >= start && regDate <= end;
      });
    }

    setFilteredRegistrations(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [registrations, filters]);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/registrations");
      const data = await response.json();
      
      if (data.success) {
        setRegistrations(data.registrations);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      if (!reloading) {
        // Only show error if not a reload operation
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal memuat data registrasi",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [reloading]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/registrations/stats");
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [fetchRegistrations, fetchStats]);

  useEffect(() => {
    applyFilters();
  }, [registrations, filters, applyFilters]);

  // Auto-reload effect
  useEffect(() => {
    if (!autoReload) return;

    const interval = setInterval(() => {
      if (!reloading) {
        setReloading(true);
        Promise.all([fetchRegistrations(), fetchStats()])
          .finally(() => setReloading(false));
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoReload, reloading, fetchRegistrations, fetchStats]);

  const reloadData = async () => {
    setReloading(true);
    try {
      await Promise.all([fetchRegistrations(), fetchStats()]);
      Swal.fire({
        icon: "success",
        title: "Data Diperbarui",
        text: "Data registrasi berhasil dimuat ulang",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat ulang data",
      });
    } finally {
      setReloading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const { value: reviewNotes } = await Swal.fire({
      title: `Update Status ke \"${newStatus}\"`,
      input: "textarea",
      inputLabel: "Catatan Review (opsional)",
      inputPlaceholder: "Masukkan catatan untuk perubahan status ini...",
      showCancelButton: true,
      confirmButtonText: "Update Status",
      cancelButtonText: "Batal",
    });

    if (reviewNotes !== undefined) {
      try {
        const response = await fetch(`/api/admin/registrations/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            status: newStatus,
            reviewNotes: reviewNotes || ""
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.fire("Berhasil!", "Status berhasil diperbarui", "success");
          reloadData();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  const handleDelete = async (id, fullName) => {
    const result = await Swal.fire({
      title: "Hapus Registrasi",
      text: `Apakah Anda yakin ingin menghapus registrasi "${fullName}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/registrations/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await response.json();
        
        if (data.success) {
          Swal.fire("Berhasil!", "Registrasi berhasil dihapus", "success");
          // Use reloadData instead of separate fetches
          reloadData();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        Swal.fire("Error!", error.message, "error");
      }
    }
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/registrations/export?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Swal.fire("Berhasil!", "Data berhasil diexport", "success");
      } else {
        throw new Error("Export gagal");
      }
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Registrasi Partner</h1>
          <p className="text-gray-600">Kelola pendaftaran partner S-Property</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-reload toggle */}
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoReload}
                onChange={(e) => setAutoReload(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Auto-reload (30s)
              </span>
            </label>
          </div>
          
          <button
            onClick={reloadData}
            disabled={reloading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync className={`mr-2 ${reloading ? 'animate-spin' : ''}`} />
            {reloading ? 'Memuat...' : 'Reload'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 ${reloading ? 'opacity-70' : ''}`}>
          <div className="flex items-center">
            <FaUsers className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {reloading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.total
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500 ${reloading ? 'opacity-70' : ''}`}>
          <div className="flex items-center">
            <FaClock className="text-yellow-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {reloading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.pending
                )}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 ${reloading ? 'opacity-70' : ''}`}>
          <div className="flex items-center">
            <FaEye className="text-blue-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">
                {reloading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.reviewed
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-green-500 ${reloading ? 'opacity-70' : ''}`}>
          <div className="flex items-center">
            <FaUserCheck className="text-green-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {reloading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.approved
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`bg-white p-4 rounded-lg shadow border-l-4 border-red-500 ${reloading ? 'opacity-70' : ''}`}>
          <div className="flex items-center">
            <FaUserTimes className="text-red-500 text-2xl mr-3" />
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {reloading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.rejected
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaFilter className="inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaSearch className="inline mr-1" />
              Pencarian
            </label>
            <input
              type="text"
              placeholder="Nama, email, atau telepon..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" />
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaCalendarAlt className="inline mr-1" />
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {reloading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center">
              <FaSync className="animate-spin text-blue-500 text-xl mr-2" />
              <span className="text-gray-600">Memuat ulang data...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendaftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((registration) => (
                <tr key={registration._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {registration.personalData.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.documents.city}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registration.personalData.category && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold text-xs">
                        {registration.personalData.category.replace(/-/g, " ")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{registration.personalData.email}</div>
                    <div className="text-sm text-gray-500">{registration.personalData.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(registration.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/registrations/${registration._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
                        title="Lihat Detail"
                      >
                        <FaEye />
                      </Link>
                      {registration.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(registration._id, "approved")}
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
                            title="Approve"
                          >
                            <FaUserCheck />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(registration._id, "rejected")}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                            title="Reject"
                          >
                            <FaUserTimes />
                          </button>
                        </>
                      )}
                      {/* Delete button - only for superadmin */}
                      {admin?.role === "superadmin" && (
                        <button
                          onClick={() => handleDelete(registration._id, registration.personalData.fullName)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus Registrasi"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> hingga{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredRegistrations.length)}
                  </span>{" "}
                  dari <span className="font-medium">{filteredRegistrations.length}</span> hasil
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredRegistrations.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Belum ada registrasi yang sesuai dengan filter yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
}
