"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function KpiConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activityScores, setActivityScores] = useState({});
  const [rules, setRules] = useState({ dailyScoreCap: 0, diminishingThreshold: 0, diminishingFactor: 1 });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/kpi/config");
      const data = await res.json();
      if (data.success) {
        setActivityScores(data.data.activityScores || {});
        setRules(data.data.rules || { dailyScoreCap: 0, diminishingThreshold: 0, diminishingFactor: 1 });
      } else {
        throw new Error(data.error || "Gagal memuat konfigurasi");
      }
    } catch (e) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleScoreChange = (key, val) => {
    setActivityScores((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const handleAddActivity = () => {
    Swal.fire({
      title: "Tambah Aktivitas",
      input: "text",
      inputPlaceholder: "Nama aktivitas baru",
      showCancelButton: true,
      confirmButtonText: "Tambah",
      cancelButtonText: "Batal",
      inputValidator: (v) => {
        if (!v || !v.trim()) return "Nama aktivitas wajib diisi";
        if (v.length > 100) return "Maksimal 100 karakter";
      },
    }).then((res) => {
      if (res.isConfirmed) {
        const key = res.value.trim();
        if (!(key in activityScores)) {
          setActivityScores((prev) => ({ ...prev, [key]: 0 }));
        }
      }
    });
  };

  const handleRemove = (key) => {
    Swal.fire({
      title: `Hapus '${key}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then((r) => {
      if (r.isConfirmed) {
        setActivityScores((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/kpi/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityScores, rules }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
      Swal.fire("Tersimpan", "Konfigurasi berhasil disimpan", "success");
    } catch (e) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="animate-pulse h-24 w-full bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KPI Config - Production</h1>
        <p className="text-gray-600">Atur jenis aktivitas, skor, dan aturan harian.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Aktivitas & Skor</h2>
          <button onClick={handleAddActivity} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">+ Tambah Aktivitas</button>
        </div>

        <div className="space-y-3">
          {Object.keys(activityScores).length === 0 && (
            <div className="text-gray-500 text-sm">Belum ada aktivitas. Tambahkan aktivitas baru.</div>
          )}
          {Object.entries(activityScores).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-medium">{key}</div>
              </div>
              <input
                type="number"
                min={0}
                max={1000}
                value={val}
                onChange={(e) => handleScoreChange(key, e.target.value)}
                className="w-28 p-2 border rounded"
              />
              <button onClick={() => handleRemove(key)} className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded">Hapus</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Aturan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Daily Score Cap</label>
            <input type="number" min={0} value={rules.dailyScoreCap}
              onChange={(e) => setRules({ ...rules, dailyScoreCap: Number(e.target.value) })}
              className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Diminishing Threshold</label>
            <input type="number" min={0} value={rules.diminishingThreshold}
              onChange={(e) => setRules({ ...rules, diminishingThreshold: Number(e.target.value) })}
              className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Diminishing Factor (0..1)</label>
            <input type="number" min={0} max={1} step="0.1" value={rules.diminishingFactor}
              onChange={(e) => setRules({ ...rules, diminishingFactor: Number(e.target.value) })}
              className="w-full p-2 border rounded" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-60">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </div>
  );
}
