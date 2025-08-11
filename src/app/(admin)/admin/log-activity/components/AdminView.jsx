"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-sm",
    Approved: "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm",
    Rejected: "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-sm",
  };
  const icons = {
    Pending: "⏳",
    Approved: "✅", 
    Rejected: "❌"
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100"
      }`}
    >
      <span className="mr-1">{icons[status]}</span>
      {status}
    </span>
  );
};

export default function AdminView() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All"); // "All", "Pending", "Approved", "Rejected"
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [viewer, setViewer] = useState({ open: false, images: [], index: 0 });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all activities for admin
  const fetchAllActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Gagal fetch aktivitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllActivities();
  }, []);

  // Filter activities based on status and search term
  useEffect(() => {
    let filtered = activities;
    
    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(activity => activity.status === statusFilter);
    }
    
    // Filter by search term (agent name or activity type)
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activityType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredActivities(filtered);
  }, [activities, statusFilter, searchTerm]);

  // Reset to first page when filters/search change or data refetched
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, activities.length]);

  const handleValidation = async (id, status) => {
    let payload = { status };

    // If rejecting, ask for a reason
    if (status === "Rejected") {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: "Alasan Penolakan",
        input: "textarea",
        inputPlaceholder: "Tuliskan alasan penolakan...",
        inputAttributes: {
          'aria-label': 'Alasan penolakan'
        },
        showCancelButton: true,
        confirmButtonText: "Kirim",
        cancelButtonText: "Batal",
        inputValidator: (value) => {
          if (!value || !value.trim()) {
            return "Alasan penolakan wajib diisi";
          }
          if (value.length > 500) {
            return "Alasan maksimal 500 karakter";
          }
        }
      });
      if (!isConfirmed) return; // cancelled
      payload.rejectReason = reason.trim();
    } else {
      // Confirm for approval
      const confirmResult = await Swal.fire({
        title: "Konfirmasi Validasi",
        text: `Yakin ingin menyetujui aktivitas ini?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Setujui!",
        cancelButtonText: "Batal"
      });
      if (!confirmResult.isConfirmed) return;
    }

    try {
      setProcessingId(id);
      const res = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memvalidasi");
      Swal.fire("Berhasil", data.message, "success");
      fetchAllActivities();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusCounts = () => {
    const pending = activities.filter(act => act.status === "Pending").length;
    const approved = activities.filter(act => act.status === "Approved").length;
    const rejected = activities.filter(act => act.status === "Rejected").length;
    return { pending, approved, rejected, total: activities.length };
  };

  const counts = getStatusCounts();

  // Derived pagination data
  const totalItems = filteredActivities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedActivities = filteredActivities.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Aktivitas</p>
              <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-400">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-400">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Filter Aktivitas</h2>
            <p className="text-gray-600 text-sm">Pilih status dan cari aktivitas tertentu</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">Semua Status ({counts.total})</option>
              <option value="Pending">Menunggu ({counts.pending})</option>
              <option value="Approved">Disetujui ({counts.approved})</option>
              <option value="Rejected">Ditolak ({counts.rejected})</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Cari agen atau aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Aktivitas 
              {statusFilter !== "All" && ` - ${statusFilter}`}
            </h2>
            <p className="text-gray-600 text-sm">
              {totalItems > 0
                ? `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalItems} aktivitas`
                : `Menampilkan 0 dari 0 aktivitas`}
            </p>
          </div>
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">Baris per halaman</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data aktivitas...</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Aktivitas</h3>
            <p className="text-gray-600">
              {searchTerm ? "Tidak ada aktivitas yang cocok dengan pencarian Anda." : "Belum ada aktivitas yang dilaporkan."}
            </p>
          </div>
        ) : (
          <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm">
              <thead className="text-left text-slate-600 bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="p-4 font-semibold">📅 Tanggal</th>
                  <th className="p-4 font-semibold">👤 Agen</th>
                  <th className="p-4 font-semibold">🎯 Aktivitas</th>
                  <th className="p-4 font-semibold">📝 Catatan</th>
                  <th className="p-4 font-semibold">🖼️ Bukti</th>
      <th className="p-4 font-semibold">❗ Alasan</th>
                  <th className="p-4 font-semibold">📊 Status</th>
                  <th className="p-4 font-semibold text-center">⚙️ Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
        {pagedActivities.map((act) => (
                  <tr key={act._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">
                      {new Date(act.date).toLocaleDateString("id-ID", {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{act.agent?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{act.agent?.agentCode || 'No Code'}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {act.activityType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">
                      <div className="truncate" title={act.notes}>
                        {act.notes || "Tidak ada catatan"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(act.attachments || []).slice(0, 3).map((img, idx) => (
                          <img
                            key={idx}
                            src={img.url}
                            alt={`Bukti ${idx + 1}`}
                            onClick={() => setViewer({ open: true, images: act.attachments || [], index: idx })}
                            className="inline-block h-8 w-8 rounded ring-2 ring-white object-cover cursor-pointer hover:opacity-80"
                          />
                        ))}
                        {(!act.attachments || act.attachments.length === 0) && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs">
                      <div className="truncate" title={act.rejectReason}>
                        {act.status === "Rejected" && act.rejectReason ? act.rejectReason : "-"}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={act.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {act.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleValidation(act._id, "Approved")}
                              disabled={processingId === act._id}
                              className={`bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 text-xs font-semibold rounded-full hover:from-green-500 hover:to-green-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                              title="Setujui aktivitas"
                            >
                              {processingId === act._id ? (
                                <span className="inline-flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Memproses...
                                </span>
                              ) : (
                                "✅ Setujui"
                              )}
                            </button>
                            <button
                              onClick={() => handleValidation(act._id, "Rejected")}
                              disabled={processingId === act._id}
                              className={`bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 text-xs font-semibold rounded-full hover:from-red-500 hover:to-red-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed`}
                              title="Tolak aktivitas"
                            >
                              {processingId === act._id ? (
                                <span className="inline-flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Memproses...
                                </span>
                              ) : (
                                "❌ Tolak"
                              )}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 px-3 py-1">
                            {act.status === "Approved" 
                              ? "✅ Sudah Disetujui" 
                              : "❌ Sudah Ditolak"
                            }
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="text-sm text-gray-600">
                Halaman {safeCurrentPage} dari {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  ‹ Prev
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${i + 1 === safeCurrentPage ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
      {/* Simple Image Viewer */}
      {viewer.open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={() => setViewer({ open: false, images: [], index: 0 })}>
          <div className="relative max-w-5xl w-full px-4" onClick={(e) => e.stopPropagation()}>
            <img src={viewer.images[viewer.index]?.url} alt="Bukti" className="max-h-[80vh] w-auto mx-auto rounded shadow-lg" />
            <button className="absolute top-4 right-6 text-white text-2xl" onClick={() => setViewer({ open: false, images: [], index: 0 })}>✕</button>
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-6">
              <button
                className="px-3 py-1 bg-white/20 text-white rounded hover:bg-white/30"
                onClick={() => setViewer((v) => ({ ...v, index: (v.index - 1 + v.images.length) % v.images.length }))}
              >◀</button>
              <div className="flex gap-2">
                {viewer.images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={`thumb ${i+1}`}
                    className={`h-10 w-10 object-cover rounded cursor-pointer ${i === viewer.index ? 'ring-2 ring-white' : 'opacity-70'}`}
                    onClick={() => setViewer((v) => ({ ...v, index: i }))}
                  />
                ))}
              </div>
              <button
                className="px-3 py-1 bg-white/20 text-white rounded hover:bg-white/30"
                onClick={() => setViewer((v) => ({ ...v, index: (v.index + 1) % v.images.length }))}
              >▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
