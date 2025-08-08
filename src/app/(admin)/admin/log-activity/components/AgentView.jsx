"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        styles[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
};

export default function AgentView() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    date: new Date().toISOString().split("T")[0],
    activityType: "",
    notes: "",
  });
  const activityTypes = [
    "Survei Klien",
    "Sesi Live",
    "Training Product Knowledge",
    "Follow Up Klien",
  ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan aktivitas");
      Swal.fire("Berhasil", data.message, "success");
      setFormState({
        date: new Date().toISOString().split("T")[0],
        activityType: "",
        notes: "",
      });
      fetchAgentActivities();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Catat Aktivitas Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formState.date}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="activityType"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Jenis Aktivitas
              </label>
              <select
                id="activityType"
                name="activityType"
                value={formState.activityType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Pilih Jenis...</option>
                {activityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Catatan
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? "Menyimpan..." : "Kirim untuk Validasi"}
            </button>
          </div>
        </form>
      </section>
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Riwayat Aktivitas Saya</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 bg-slate-50">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Aktivitas</th>
                  <th className="p-3">Catatan</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act._id} className="border-b">
                    <td className="p-3">
                      {new Date(act.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-3">{act.activityType}</td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">
                      {act.notes}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={act.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
