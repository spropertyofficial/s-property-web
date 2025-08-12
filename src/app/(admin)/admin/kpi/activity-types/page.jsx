"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function ActivityTypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", score: 0, description: "" });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity-types");
      const data = await res.json();
      if (data.success) setItems(data.items || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", score: 0, description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Confirm before create/update
    const confirm = await Swal.fire({
      title: editingId ? "Simpan Perubahan?" : "Tambah Aktivitas?",
      text: editingId ? "Perubahan akan disimpan." : "Aktivitas baru akan ditambahkan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: editingId ? "Ya, Simpan" : "Ya, Tambah",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/activity-types/${editingId}` : "/api/activity-types";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        name: form.name.trim(),
        score: Number(form.score) || 0,
        description: form.description?.trim() || "",
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      Swal.fire("Berhasil", editingId ? "Aktivitas diperbarui" : "Aktivitas ditambahkan", "success");
      resetForm();
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, score: item.score, description: item.description || "" });
  };

  const handleToggleActive = async (item) => {
    // Confirm toggle active state
    const willActivate = !item.isActive;
    const confirm = await Swal.fire({
      title: willActivate ? "Aktifkan Aktivitas?" : "Nonaktifkan Aktivitas?",
      text: willActivate
        ? `Aktivitas "${item.name}" akan diaktifkan dan bisa dipakai user.`
        : `Aktivitas "${item.name}" akan dinonaktifkan dan tidak muncul di user.`,
      icon: willActivate ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: willActivate ? "Ya, Aktifkan" : "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      confirmButtonColor: willActivate ? "#16a34a" : "#ef4444",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`/api/activity-types/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status");
      await Swal.fire("Berhasil", willActivate ? "Aktivitas diaktifkan" : "Aktivitas dinonaktifkan", "success");
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  const handleDelete = async (item) => {
    const confirm = await Swal.fire({
      title: "Nonaktifkan Aktivitas?",
      text: `Aktivitas "${item.name}" akan dinonaktifkan dan tidak muncul di user.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Nonaktifkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`/api/activity-types/${item._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menonaktifkan");
  await Swal.fire("Berhasil", "Aktivitas telah dinonaktifkan", "success");
      fetchItems();
    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-400">
        <h1 className="text-2xl font-bold text-gray-900">Aktivitas & Skor</h1>
        <p className="text-gray-600">Kelola daftar aktivitas yang dipakai agent beserta skornya.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? "Edit Aktivitas" : "Tambah Aktivitas"}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Aktivitas</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Listing Baru"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skor</label>
            <input
              type="number"
              min="0"
              value={form.score}
              onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi singkat"
              maxLength={500}
            />
          </div>
          <div className="flex gap-2 md:col-span-3 justify-end">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Daftar Aktivitas</h2>
          <span className="text-sm text-gray-500">{items.length} item</span>
        </div>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Belum ada aktivitas. Tambahkan di atas.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3 text-left font-medium">Nama</th>
                  <th className="p-3 text-left font-medium">Skor</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Deskripsi</th>
                  <th className="p-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((it) => (
                  <tr key={it._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{it.name}</td>
                    <td className="p-3">{it.score}</td>
                    <td className="p-3">
                      {it.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Aktif</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Nonaktif</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 max-w-md">
                      <div className="truncate" title={it.description}>{it.description || "-"}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(it)}
                          className="px-3 py-1 rounded-md text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(it)}
                          className="px-3 py-1 rounded-md text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          {it.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                        <button
                          onClick={() => handleDelete(it)}
                          className="px-3 py-1 rounded-md text-xs bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
