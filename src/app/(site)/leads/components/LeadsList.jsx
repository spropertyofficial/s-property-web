"use client";
import useLeads from "./useLeads";
import LeadCard from "./LeadCard";
import LeadStatusBadge from "./LeadStatusBadge";
import { useEffect, useRef, useState } from "react";

const STATUSES = ["","Baru","Hot","Warm","Cold","Reservasi","Booking","Closing","No Respond"];

export default function LeadsList({ onCreate }) {
  const { data, loading, error, page, limit, q, status, totalPages, total, setPage, setLimit, setQ, setStatus } = useLeads();
  // Quick detail modal for fast actions
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={e=>{setPage(1); setQ(e.target.value);}} placeholder="Cari nama / kontak / email" className="flex-1 min-w-[160px] rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <select value={status} onChange={e=>{setPage(1); setStatus(e.target.value);}} className="rounded border border-slate-300 px-2 py-2 text-sm bg-white">
          {STATUSES.map(s=> <option key={s} value={s}>{s || 'Semua Status'}</option>)}
        </select>
  {/* date filters removed */}
        <select value={limit} onChange={e=>{setPage(1); setLimit(Number(e.target.value));}} className="rounded border border-slate-300 px-2 py-2 text-sm bg-white">
          {[5,10,20,50].map(l=> <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      {loading && <p className="text-sm text-slate-500">Memuat...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && data.length === 0 && <p className="text-sm text-slate-500">Tidak ada lead.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((ld, i) => (
          <LeadCard
            key={ld._id}
            index={i}
            lead={ld}
            onQuickOpen={(lead)=> setSelected(lead)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
        <span>{total} total</span>
        <div className="flex gap-2 items-center">
          <button disabled={page<=1} onClick={()=> setPage(p=>p-1)} className="px-2 py-1 rounded border disabled:opacity-40">Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=> setPage(p=>p+1)} className="px-2 py-1 rounded border disabled:opacity-40">Next</button>
        </div>
      </div>
  {selected && (
    <DetailModal
      lead={selected}
      onClose={()=> setSelected(null)}
      onSaved={(updated)=> {
        setSelected(null);
      }}
    />
  )}
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

function DetailModal({ lead, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const [error, setError] = useState(null);
  const [openStatus, setOpenStatus] = useState(false);
  const statusBtnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => { setStatus(lead.status); }, [lead.status]);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    function onDocClick(e){
      if(!openStatus) return;
      if(menuRef.current?.contains(e.target) || statusBtnRef.current?.contains(e.target)) return;
      setOpenStatus(false);
    }
    function onKey(e){ if(e.key === 'Escape') setOpenStatus(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openStatus]);

  async function save() {
    if (status === lead.status) { onClose(); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/leads/${lead._id}/status`, { method: 'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal update status');
      window.dispatchEvent(new CustomEvent('lead:status', { detail: { id: lead._id, status } }));
      onSaved?.(json.data);
    } catch(e) { setError(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div onClick={e=> e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 flex flex-col gap-4 animate-sheet-up sm:animate-scale-in">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Detail Lead</h2>
          <button type="button" onClick={onClose} className="text-slate-500">✕</button>
        </div>
        <div className="grid gap-2 text-sm">
          <div><span className="text-[11px] text-slate-500 uppercase">Nama</span><div>{lead.name || '-'}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">Kontak</span><div>{lead.contact || '-'}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">Email</span><div>{lead.email || '-'}</div></div>
          <div><span className="text-[11px] text-slate-500 uppercase">Properti</span><div>{lead.property?.name || lead.propertyName || '-'}</div></div>
        </div>
        <div className="border-t pt-3 mt-2 space-y-2">
          <p className="text-xs font-medium text-slate-500">Ubah Status</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 items-center">
            <div className="relative min-w-[180px]">
              <button
                type="button"
                ref={statusBtnRef}
                onClick={()=> setOpenStatus(o=> !o)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white text-left flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={openStatus}
              >
                <span>{status}</span>
                <svg className={`w-4 h-4 transition-transform ${openStatus ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L10 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 12z" clipRule="evenodd"/></svg>
              </button>
              {openStatus && (
                <ul
                  ref={menuRef}
                  role="listbox"
                  className="absolute bottom-full mb-1 left-0 w-full max-h-48 overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg z-10"
                >
                  {STATUSES.filter(s=> s).map(s => (
                    <li
                      key={s}
                      role="option"
                      aria-selected={status === s}
                      onClick={()=> { setStatus(s); setOpenStatus(false); }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${status===s ? 'bg-blue-50 font-medium' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{s}</span>
                        <LeadStatusBadge status={s} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button disabled={saving} onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-50">{saving? 'Menyimpan...' : 'Simpan'}</button>
          </div>
          <div className="mt-1"><LeadStatusBadge status={status} /></div>
        </div>
      </div>
    </div>
  );
}
