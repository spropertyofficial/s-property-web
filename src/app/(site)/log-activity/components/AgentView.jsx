"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DeferredImageGalleryUpload from "@/app/(admin)/admin/components/DeferredImageGalleryUpload";
import { useRef } from "react";

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

export default function AgentView() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split("T")[0],
    activityType: "",
    activityTypeId: "",
    notes: "",
    gallery: [],
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [stagedItems, setStagedItems] = useState([]); // mix of existing and new
  const uploaderRef = useRef(null);
  const [activityTypes, setActivityTypes] = useState([]); // { _id, name, score }

  const fetchAgentActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success) setActivities(data.activities);
    } catch (error) {
      console.error("Gagal fetch aktivitas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentActivities();
  }, []);

  // Reset to first page when activities change or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activities, pageSize]);

  // Load activity types from API
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const res = await fetch("/api/activity-types");
        const data = await res.json();
        if (data.success) {
          setActivityTypes(data.items || []);
        }
      } catch (e) {
        // keep empty; admin should configure
      }
    };
    loadTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Upload deferred images first and get attachments array
      const attachments = await uploaderRef.current?.uploadAll();
      if (!attachments || attachments.length < 1) {
        throw new Error("Minimal 1 bukti gambar wajib diunggah");
      }
      const url = editingActivity 
        ? `/api/activities/${editingActivity._id}` 
        : "/api/activities";
      const method = editingActivity ? "PUT" : "POST";

      const payload = {
        date: formState.date,
        notes: formState.notes,
        // Send both id and name for compatibility
        activityTypeId: formState.activityTypeId || undefined,
        activityType: formState.activityType || undefined,
        attachments,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan aktivitas");
      
      const successMessage = editingActivity 
        ? "Aktivitas berhasil diperbarui" 
        : data.message;
      
      Swal.fire("Berhasil", successMessage, "success");
      
      // Reset form
      setFormState({
        date: new Date().toISOString().split("T")[0],
        activityType: "",
        activityTypeId: "",
        notes: "",
        gallery: [],
      });
      setPreviewImages([]);
      setStagedItems([]);
      setEditingActivity(null);
      
      fetchAgentActivities();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    if (activity.status !== "Pending") {
      Swal.fire("Tidak Dapat Edit", "Hanya aktivitas dengan status pending yang dapat diedit", "warning");
      return;
    }
    
    setEditingActivity(activity);
    setFormState({
      date: new Date(activity.date).toISOString().split("T")[0],
      activityType: activity.activityType,
      activityTypeId: activity.activityTypeId || "",
      notes: activity.notes || "",
      gallery: (activity.attachments || []).map((a) => ({
        src: a.url,
        publicId: a.publicId,
        size: a.size,
        mimeType: a.mimeType,
        width: a.width,
        height: a.height,
      })),
    });
    // Set preview images for uploader
    setPreviewImages((activity.attachments || []).map((a) => ({
      url: a.url,
      name: a.publicId || "",
      size: a.size,
      publicId: a.publicId,
      uploadType: "activity",
      uploaded: true,
    })));
    setStagedItems((activity.attachments || []).map((a) => ({
      kind: "existing",
      url: a.url,
      publicId: a.publicId,
      size: a.size,
      mimeType: a.mimeType,
      width: a.width,
      height: a.height,
    })));
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setFormState({
      date: new Date().toISOString().split("T")[0],
      activityType: "",
      notes: "",
      gallery: [],
    });
    setPreviewImages([]);
  setStagedItems([]);
  };

  const handleDelete = async (activityId, activityType) => {
    const activity = activities.find(act => act._id === activityId);
    if (activity.status !== "Pending") {
      Swal.fire("Tidak Dapat Hapus", "Hanya aktivitas dengan status pending yang dapat dihapus", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Yakin ingin menghapus aktivitas "${activityType}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/activities/${activityId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Gagal menghapus aktivitas");
        
        Swal.fire("Terhapus!", data.message, "success");
        fetchAgentActivities();
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-tosca-200">
        <div className="flex items-center mb-6">
          <div className="bg-tosca-50 p-3 rounded-lg mr-4">
            <svg className="w-6 h-6 text-tosca-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingActivity ? "Edit Aktivitas" : "Catat Aktivitas Baru"}
            </h2>
            <p className="text-gray-600 text-sm">
              {editingActivity 
                ? "Perbarui informasi aktivitas Anda" 
                : "Tambahkan aktivitas harian Anda untuk evaluasi"
              }
            </p>
          </div>
          {editingActivity && (
            <button
              onClick={handleCancelEdit}
              className="ml-auto bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                📅 Tanggal Aktivitas
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formState.date}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-tosca-200 focus:ring-2 focus:ring-tosca-100 transition-all"
                required
              />
            </div>
            <div>
              <label
                htmlFor="activityType"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                🎯 Jenis Aktivitas
              </label>
              <select
                id="activityType"
                name="activityType"
                value={formState.activityType}
                onChange={(e) => {
                  const name = e.target.value;
                  const found = activityTypes.find((t) => t.name === name);
                  setFormState((prev) => ({
                    ...prev,
                    activityType: name,
                    activityTypeId: found?._id || "",
                  }));
                }}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-tosca-200 focus:ring-2 focus:ring-tosca-100 transition-all"
                required
              >
                  <option value="">Pilih Jenis Aktivitas...</option>
                  {activityTypes.map((type) => (
                    <option key={type._id} value={type.name}>
                      {type.name} {type.score > 0 ? `(+${type.score})` : ""}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              📝 Detail Catatan
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Ceritakan detail aktivitas yang Anda lakukan..."
              maxLength={1000}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-tosca-200 focus:ring-2 focus:ring-tosca-100 transition-all resize-none"
            ></textarea>
            <div className="text-right text-xs text-gray-500 mt-1">
              {formState.notes.length}/1000 karakter
            </div>
          </div>
          {/* Evidence Upload */}
          <div>
            <DeferredImageGalleryUpload
              ref={uploaderRef}
              stagedItems={stagedItems}
              setStagedItems={setStagedItems}
              previewImages={previewImages}
              setPreviewImages={setPreviewImages}
              maxImages={6}
              uploadType="activity" // reusable component; here we use activity mode
              title="Bukti Aktivitas (Wajib)"
              description="Pilih gambar bukti. Gambar akan diunggah saat Anda menekan tombol kirim. Maks 10MB per gambar."
              gridCols="grid-cols-2 md:grid-cols-3"
              required
              isSubmitting={isSubmitting}
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-tosca-200 to-tosca-300 text-white font-bold px-8 py-3 rounded-lg hover:from-tosca-300 hover:to-tosca-400 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {editingActivity ? "Perbarui Aktivitas" : "Kirim untuk Validasi"}
                </span>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* History Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Riwayat Aktivitas Saya</h2>
              <p className="text-gray-600 text-sm">Pantau status dan progres aktivitas Anda</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-sm font-semibold text-gray-600">
                Total: {activities.length} aktivitas
              </span>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100">
              <span className="text-sm font-semibold text-green-700">
                Poin Disetujui: {activities.filter(a => a.status === "Approved").reduce((s, a) => s + (a.score || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tosca-200 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat riwayat aktivitas...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Aktivitas</h3>
            <p className="text-gray-600">Mulai catat aktivitas harian Anda untuk mendapatkan evaluasi performa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {/* Page Size Selector */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b bg-slate-50">
              <div className="text-sm text-gray-600">
                Menampilkan {Math.min((currentPage - 1) * pageSize + 1, activities.length)}–
                {Math.min(currentPage * pageSize, activities.length)} dari {activities.length}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Baris per halaman:</label>
                <select
                  className="px-2 py-1 border rounded"
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            <table className="w-full text-sm">
        <thead className="text-left text-slate-600 bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="p-4 font-semibold">📅 Tanggal</th>
                  <th className="p-4 font-semibold">🎯 Aktivitas</th>
                  <th className="p-4 font-semibold">📝 Catatan</th>
                  <th className="p-4 font-semibold">🖼️ Bukti</th>
                  <th className="p-4 font-semibold">🏆 Poin</th>
          <th className="p-4 font-semibold">❗ Alasan</th>
                  <th className="p-4 font-semibold">📊 Status</th>
                  <th className="p-4 font-semibold">⚙️ Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((act) => (
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
                            className="inline-block h-8 w-8 rounded ring-2 ring-white object-cover"
                          />
                        ))}
                        {(!act.attachments || act.attachments.length === 0) && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {act.status === "Approved" ? (act.score || 0) : "-"}
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
                      <div className="flex space-x-2">
                        {act.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleEdit(act)}
                              className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors"
                              title="Edit aktivitas"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(act._id, act.activityType)}
                              className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-medium hover:bg-red-200 transition-colors"
                              title="Hapus aktivitas"
                            >
                              🗑️ Hapus
                            </button>
                          </>
                        )}
                        {act.status !== "Pending" && (
                          <span className="text-xs text-gray-400 px-3 py-1">
                            {act.status === "Approved" ? "✅ Disetujui" : "❌ Ditolak"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t bg-slate-50">
              <div className="text-sm text-gray-600">
                Halaman {activities.length === 0 ? 0 : currentPage} dari {Math.max(1, Math.ceil(activities.length / pageSize))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                  aria-label="Halaman pertama"
                >«</button>
                <button
                  type="button"
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Sebelumnya"
                >‹</button>
                <button
                  type="button"
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(activities.length / pageSize), p + 1))}
                  disabled={currentPage >= Math.ceil(activities.length / pageSize) || activities.length === 0}
                  aria-label="Berikutnya"
                >›</button>
                <button
                  type="button"
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => setCurrentPage(Math.max(1, Math.ceil(activities.length / pageSize)))}
                  disabled={currentPage >= Math.ceil(activities.length / pageSize) || activities.length === 0}
                  aria-label="Halaman terakhir"
                >»</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
