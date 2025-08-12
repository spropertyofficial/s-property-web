"use client";

import { useState, useEffect, useRef } from "react";
import LeaderboardTable from "./components/LeaderboardTable";
import CompositionChart from "./components/CompositionChart";
import TrendChart from "./components/TrendChart";

export default function KpiProductionPage() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [tableLoading, setTableLoading] = useState(false);
  const lastParamsRef = useRef({ days, page, pageSize });

  // Reset to first page when days or page size changes
  useEffect(() => {
    setPage(1);
  }, [days, pageSize]);

  useEffect(() => {
    const fetchKpiData = async () => {
      const prev = lastParamsRef.current;
      const daysChanged = days !== prev.days;
      const paginationChanged = days === prev.days && (page !== prev.page || pageSize !== prev.pageSize);
      if (daysChanged || !kpiData) {
        setLoading(true);
      } else if (paginationChanged) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }
      try {
  const res = await fetch(`/api/kpi/production?days=${days}&page=${page}&limit=${pageSize}`);
        const result = await res.json();
        if (result.success) {
          setKpiData(result.data);
        } else {
          throw new Error(result.error || "Gagal memuat data KPI");
        }
      } catch (error) {
        console.error(error);
      } finally {
        const prev = lastParamsRef.current;
        const daysChanged = days !== prev.days;
        const paginationChanged = days === prev.days && (page !== prev.page || pageSize !== prev.pageSize);
        if (daysChanged || !kpiData) {
          setLoading(false);
        }
        if (paginationChanged) {
          setTableLoading(false);
        }
        lastParamsRef.current = { days, page, pageSize };
      }
    };
    fetchKpiData();
  }, [days, page, pageSize]);

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
            onChange={(e) => { setDays(Number(e.target.value)); setPage(1); }}
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
            {/* Top bar: count and page size selector */}
            {kpiData?.pagination && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 border rounded-lg p-3 bg-slate-50">
                <div className="text-sm text-gray-600">
                  Menampilkan {Math.min(((kpiData.pagination.page - 1) * kpiData.pagination.limit) + 1, kpiData.pagination.total)}–
                  {Math.min(kpiData.pagination.page * kpiData.pagination.limit, kpiData.pagination.total)} dari {kpiData.pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Baris per halaman:</label>
                  <select
                    className="px-2 py-1 border rounded"
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                  >
                    {[5, 10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Table loading indicator (scoped) */}
            {tableLoading && (
              <div className="mb-2 text-xs text-gray-500">Memuat baris...</div>
            )}
            <LeaderboardTable
              data={kpiData.leaderboard}
              activityTypes={kpiData.activityTypes || []}
            />
            {kpiData?.pagination && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 border bg-slate-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Halaman {kpiData.pagination.total === 0 ? 0 : kpiData.pagination.page} dari {Math.max(1, kpiData.pagination.totalPages)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(1)}
                    disabled={kpiData.pagination.page <= 1}
                    aria-label="Halaman pertama"
                  >«</button>
                  <button
                    type="button"
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={kpiData.pagination.page <= 1}
                    aria-label="Sebelumnya"
                  >‹</button>
                  <button
                    type="button"
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.min(kpiData.pagination.totalPages, p + 1))}
                    disabled={kpiData.pagination.page >= kpiData.pagination.totalPages || kpiData.pagination.total === 0}
                    aria-label="Berikutnya"
                  >›</button>
                  <button
                    type="button"
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage(Math.max(1, kpiData.pagination.totalPages))}
                    disabled={kpiData.pagination.page >= kpiData.pagination.totalPages || kpiData.pagination.total === 0}
                    aria-label="Halaman terakhir"
                  >»</button>
                </div>
              </div>
            )}
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
