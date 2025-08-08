"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function AdminView() {
  const [pendingActivities, setPendingActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success) setPendingActivities(data.activities);
    } catch (error) {
      console.error("Gagal fetch aktivitas pending:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const handleValidation = async (id, status) => {
    try {
      const res = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memvalidasi");
      Swal.fire("Berhasil", data.message, "success");
      fetchPendingActivities();
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        Aktivitas Menunggu Persetujuan ({pendingActivities.length})
      </h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 bg-slate-50">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Agen</th>
                <th className="p-3">Aktivitas</th>
                <th className="p-3">Catatan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingActivities.map((act) => (
                <tr key={act._id} className="border-b">
                  <td className="p-3">
                    {new Date(act.date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="p-3 font-medium">{act.agent.name}</td>
                  <td className="p-3">{act.activityType}</td>
                  <td className="p-3 text-slate-500 truncate max-w-xs">
                    {act.notes}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleValidation(act._id, "Approved")}
                        className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full hover:bg-green-200"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleValidation(act._id, "Rejected")}
                        className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
