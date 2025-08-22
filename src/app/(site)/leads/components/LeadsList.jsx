"use client";
import useLeads from "./useLeads";
import LeadCard from "./LeadCard";
import LeadStatusBadge from "./LeadStatusBadge";
import { useState } from "react";

const STATUSES = ["","Baru","Hot","Warm","Cold","Reservasi","Booking","Closing","No Respond"];

export default function LeadsList({ onCreate }) {
  const { data, loading, error, page, limit, q, status, totalPages, total, setPage, setLimit, setQ, setStatus } = useLeads();
  // Removed inline detail modal; direct navigation via Link in LeadCard
  const [selected, setSelected] = useState(null); // kept if needed later

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={e=>{setPage(1); setQ(e.target.value);}} placeholder="Cari nama / kontak / email" className="flex-1 min-w-[160px] rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <select value={status} onChange={e=>{setPage(1); setStatus(e.target.value);}} className="rounded border border-slate-300 px-2 py-2 text-sm bg-white">
          {STATUSES.map(s=> <option key={s} value={s}>{s || 'Semua Status'}</option>)}
        </select>
        <select value={limit} onChange={e=>{setPage(1); setLimit(Number(e.target.value));}} className="rounded border border-slate-300 px-2 py-2 text-sm bg-white">
          {[5,10,20,50].map(l=> <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && data.length === 0 && <p className="text-sm text-slate-500">Tidak ada lead.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((ld, i) => <LeadCard key={ld._id} index={i} lead={ld} />)}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        <span>{total} total</span>
        <div className="flex gap-2 items-center">
          <button disabled={page<=1} onClick={()=> setPage(p=>p-1)} className="px-2 py-1 rounded border disabled:opacity-40">Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=> setPage(p=>p+1)} className="px-2 py-1 rounded border disabled:opacity-40">Next</button>
        </div>
      </div>
  {/* Modal detail dihapus untuk direct navigation */}
    </div>
  );
}

function StatusChanger({ selected, onUpdated, onClose }) {
  const [status, setStatus] = useState(selected.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  async function updateStatus() {
    if (status === selected.status) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/leads/${selected._id}/status`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal update status');
      window.dispatchEvent(new CustomEvent('lead:status', { detail: { id: selected._id, status } }));
      onUpdated?.(json.data);
    } catch(e) {
      setError(e.message);
    } finally { setSaving(false); }
  }
  return (
    <div className="border-t pt-3 mt-2 space-y-2">
      <p className="text-xs font-medium text-slate-500">Ubah Status</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 items-center">
        <select value={status} onChange={e=> setStatus(e.target.value)} className="rounded border border-slate-300 px-2 py-1 text-xs bg-white">
          {STATUSES.filter(s=> s).map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button disabled={saving || status===selected.status} onClick={updateStatus} className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-50">{saving? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </div>
  );
}
