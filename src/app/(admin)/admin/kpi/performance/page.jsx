"use client";

import { useEffect, useMemo, useState } from "react";
import PerformanceTrendChart from "./components/PerformanceTrendChart";
import PerformanceCompositionChart from "./components/PerformanceCompositionChart";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function KpiPerformancePage() {
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [composition, setComposition] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [exportType, setExportType] = useState("all");

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // hitung range 6 bulan terakhir berakhir di bulan terpilih
        const [py, pm] = period.split("-").map(Number);
        const endY = py,
          endM = pm; // inclusive end month
        const startDate = new Date(Date.UTC(endY, endM - 1, 1));
        startDate.setUTCMonth(startDate.getUTCMonth() - 5);
        const startY = startDate.getUTCFullYear();
        const startM = String(startDate.getUTCMonth() + 1).padStart(2, "0");
        const start = `${startY}-${startM}`;
        const end = period; // YYYY-MM

        const [s, t, c, l] = await Promise.all([
          fetch(`/api/kpi/performance/summary?period=${period}`).then((r) =>
            r.json()
          ),
          fetch(`/api/kpi/performance/trend?start=${start}&end=${end}`).then(
            (r) => r.json()
          ),
          fetch(
            `/api/kpi/performance/composition?period=${period}&by=assetType`
          ).then((r) => r.json()),
          fetch(
            `/api/kpi/performance/leaderboard?period=${period}&topN=10`
          ).then((r) => r.json()),
        ]);
        if (s.success) setSummary(s);
        else setSummary(null);
        if (t.success) setTrend(t);
        else setTrend(null);
        if (c.success) setComposition(c);
        else setComposition(null);
        if (l.success) setLeaderboard(l.leaderboard || []);
        else setLeaderboard([]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const handleMonthChange = (e) => setPeriod(e.target.value);
  const shiftMonth = (delta) => {
    const [y, m] = period.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1, 1));
    d.setUTCMonth(d.getUTCMonth() + delta);
    const ny = d.getUTCFullYear();
    const nm = String(d.getUTCMonth() + 1).padStart(2, "0");
    setPeriod(`${ny}-${nm}`);
  };
  const buildExportXlsxUrl = () => {
    const s = exportStart || period;
    const e = exportEnd || period;
    return `/api/sales-records/export-xlsx?type=${encodeURIComponent(exportType)}&start=${s}&end=${e}`;
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            KPI Performance
          </h1>
          <p className="mt-1 text-slate-500">
            Pendapatan, unit terjual, dan harga rata-rata per bulan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium" htmlFor="period">
              Periode:
            </label>
            <button
              className="px-2 py-1 border rounded"
              onClick={() => shiftMonth(-1)}
              aria-label="Bulan sebelumnya"
            >
              <ArrowLeft />
            </button>
            <input
              id="period"
              type="month"
              value={period}
              onChange={handleMonthChange}
              className="p-2 border rounded-md shadow-sm"
            />
            <button
              className="px-2 py-1 border rounded"
              onClick={() => shiftMonth(1)}
              aria-label="Bulan berikutnya"
            >
              <ArrowRight />
            </button>
          </div>
          <div>
            <button
              className="px-3 py-2 bg-emerald-600 text-white rounded"
              onClick={() => {
                // default rentang export = bulan terpilih
                setExportStart(period);
                setExportEnd(period);
                setExportType("all");
                setExportOpen(true);
              }}
            >
              Export
            </button>
          </div>
  </div>
      </header>

      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : !summary ? (
        <div className="text-center py-10">Tidak ada data.</div>
      ) : (
        <div className="space-y-8">
          {exportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white w-full max-w-lg rounded-lg shadow p-6 mx-4">
                <h3 className="text-lg font-semibold mb-4">Export ke Excel (XLSX)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Mulai (bulan)</label>
                    <input type="month" className="w-full border rounded p-2" value={exportStart} onChange={(e)=>setExportStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Sampai (bulan)</label>
                    <input type="month" className="w-full border rounded p-2" value={exportEnd} onChange={(e)=>setExportEnd(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium">Jenis Export</label>
                    <select className="w-full border rounded p-2" value={exportType} onChange={(e)=>setExportType(e.target.value)}>
                      <option value="all">Lengkap (Semua Sheet)</option>
                      <option value="detail">Detail Penjualan</option>
                      <option value="rekap">Rekap Bulanan</option>
                      <option value="komposisi">Komposisi Tipe Aset</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button className="px-4 py-2 border rounded" onClick={()=>setExportOpen(false)}>Batal</button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded" onClick={()=>{
                    const url = buildExportXlsxUrl();
                    window.open(url, '_blank');
                    setExportOpen(false);
                  }}>Unduh XLSX</button>
                </div>
                <p className="text-xs text-slate-500 mt-3">Catatan: Grafik Excel tidak otomatis dibuat. Anda bisa membuat chart dari sheet Rekap/Komposisi langsung di Excel.</p>
              </div>
            </div>
          )}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="text-sm text-slate-500">Pendapatan Total</div>
              <div className="text-2xl font-bold">
                {currency.format(summary.pendapatanTotal || 0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="text-sm text-slate-500">Unit Terjual</div>
              <div className="text-2xl font-bold">
                {summary.unitTerjual || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="text-sm text-slate-500">Harga Rata-rata</div>
              <div className="text-2xl font-bold">
                {currency.format(summary.hargaRata2 || 0)}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">
                Tren Pendapatan 6 Bulan Terakhir
              </h2>
              <div className="h-80">
                <PerformanceTrendChart trend={trend} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-center">
                Komposisi Pendapatan per Tipe Aset
              </h2>
              <div className="h-80">
                <PerformanceCompositionChart composition={composition} />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Top Sales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 border">Rank</th>
                    <th className="p-2 border">Agent</th>
                    <th className="p-2 border">Pendapatan</th>
                    <th className="p-2 border">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={String(row.agentId)} className="hover:bg-slate-50">
                      <td className="p-2 border text-center">{row.rank}</td>
                      <td className="p-2 border">{row.agentName || "-"}</td>
                      <td className="p-2 border text-right">
                        {currency.format(row.pendapatanTotal || 0)}
                      </td>
                      <td className="p-2 border text-center">
                        {row.unitTerjual || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
