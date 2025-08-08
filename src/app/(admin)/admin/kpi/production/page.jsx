"use client";

import { useState, useEffect } from "react";
import LeaderboardTable from "./components/LeaderboardTable";
import CompositionChart from "./components/CompositionChart";
import TrendChart from "./components/TrendChart";

export default function KpiProductionPage() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchKpiData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/kpi/production?days=${days}`);
        const result = await res.json();
        if (result.success) {
          setKpiData(result.data);
        } else {
          throw new Error(result.error || "Gagal memuat data KPI");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchKpiData();
  }, [days]);

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Analisis Produksi Mitra
          </h1>
          <p className="mt-1 text-slate-500">
            Memonitor aktivitas dan produktivitas tim.
          </p>
        </div>
        <div>
          <label htmlFor="prod-date-filter" className="text-sm font-medium">
            Periode:
          </label>
          <select
            id="prod-date-filter"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 block w-full sm:w-auto p-2 border rounded-md shadow-sm"
          >
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="90">90 Hari Terakhir</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-10">Memuat data dasbor...</div>
      ) : kpiData ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">
              Papan Peringkat Produktivitas
            </h2>
            <LeaderboardTable data={kpiData.leaderboard} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">
                Komposisi Aktivitas
              </h2>
              <div className="h-80">
                <CompositionChart data={kpiData.composition} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">
                Tren Aktivitas Tim
              </h2>
              <div className="h-80">
                <TrendChart data={kpiData.trend} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">Gagal memuat data.</div>
      )}
    </div>
  );
}
