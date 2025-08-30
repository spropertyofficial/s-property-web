"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SOURCES } from "@/lib/constants/leads";
import LeadStatusBadge from "@/app/(site)/leads/components/LeadStatusBadge";

const STATUSES = [
  "",
  "Baru",
  "Hot",
  "Warm",
  "Cold",
  "Reservasi",
  "Booking",
  "Closing",
  "No Respond",
];

export default function AdminLeadsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [agent, setAgent] = useState(""); // Mitra (agent)
  const [source, setSource] = useState("");
  // date filters removed
  const [agents, setAgents] = useState([]);
  // sources now static from constants
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (agent) params.set("agent", agent); // requires ObjectId
  if (source) params.set("source", source);
  const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memuat");
      setItems(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, q, status, agent, source]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Load Mitra options
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/users/agents");
        const j = await res.json();
        if (j.success) setAgents(j.items || []);
      } catch {}
    })();
  }, []);

  // Using static SOURCES list for filter options

  const exportUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (agent) p.set("agent", agent);
    if (source) p.set("source", source);
    return `/api/admin/leads/export?${p.toString()}`;
  }, [q, status, agent, source]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">
            Master Data Leads
          </h1>
          <p className="text-xs text-slate-500">
            Monitor, filter, dan ekspor semua leads
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={exportUrl}
            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
          >
            Export Excel
          </a>
        </div>
      </header>

      <section className="bg-white rounded-lg border p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Cari nama/kontak/email"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={agent}
            onChange={(e) => {
              setPage(1);
              setAgent(e.target.value);
            }}
            className="rounded border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Semua Mitra</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name} {a.agentCode ? `(${a.agentCode})` : ""}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="rounded border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            {STATUSES.map((s) => (
              <option key={s || "ALL"} value={s}>
                {s || "Semua Status"}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => {
              setPage(1);
              setSource(e.target.value);
            }}
            className="rounded border border-slate-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Semua Sumber</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {/* date filters removed */}
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setPage(1);
                setLimit(Number(e.target.value));
              }}
              className="rounded border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setPage(1);
                fetchLeads();
              }}
              className="px-3 py-2 rounded bg-teal-600 text-white text-sm"
            >
              Terapkan
            </button>
          </div>
        </div>
      </section>

  {/* Mobile cards */}
      <section className="sm:hidden">
        {loading && <p className="text-sm text-slate-500">Memuat…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-slate-500">Tidak ada data.</p>
        )}
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it._id} className="rounded border bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{it.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {it.email || "-"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {it.contact || "-"}
                  </p>
                </div>
                <LeadStatusBadge status={it.status} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {it.property?.name || it.propertyName || "-"}
                {it.unit ? ` • ${it.unit}` : ""}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                Milik: {it.agent?.name || "-"} • Sumber: {it.source || "-"}
              </p>
              <div className="mt-2 flex justify-between items-start text-[11px] text-slate-500 gap-2">
                <div className="space-y-0.5">
                  <div>
                    <span className="font-medium">Tanggal Lead Masuk:</span> {new Date(it.leadInAt || it.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Tanggal Ditambahkan:</span> {new Date(it.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/admin/leads/${it._id}`}
                  className="text-tosca-600"
                >
                  Detail
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Desktop table */}
      <section className="hidden sm:block bg-white rounded-lg border overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">Tanggal Lead Masuk</th>
              <th className="px-3 py-2">Tanggal Ditambahkan</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">Kontak</th>
              <th className="px-3 py-2">Properti</th>
              <th className="px-3 py-2">Milik</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Sumber</th>
              <th className="px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={9}>
                  Memuat…
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={9}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={9}>
                  Tidak ada data
                </td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it._id} className="border-t">
                <td className="px-3 py-2">{new Date(it.leadInAt || it.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{new Date(it.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 font-medium">{it.name}</td>
                <td className="px-3 py-2">{it.contact || "-"}</td>
                <td className="px-3 py-2">
                  {it.property?.name || it.propertyName || "-"}
                </td>
                <td className="px-3 py-2">{it.agent?.name || "-"}</td>
                <td className="px-3 py-2">
                  <LeadStatusBadge status={it.status} />
                </td>
                <td className="px-3 py-2">{it.source || "-"}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/leads/${it._id}`}
                    className="text-tosca-600 hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="flex items-center justify-between text-xs text-slate-600">
        <span>{total} total</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded border disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
