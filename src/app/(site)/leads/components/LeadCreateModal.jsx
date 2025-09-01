"use client";
import { useState, useRef, useEffect } from "react";
import PropertyTypeahead from "./PropertyTypeahead";
import { toastError } from "@/utils/swal";
import { SOURCES } from "@/lib/constants/leads";
import { useAuth } from "@/context/AuthContext";

export default function LeadCreateModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const todayStr = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();
  const [form, setForm] = useState({
    leadInAt: todayStr, // YYYY-MM-DD
    name: "",
    contact: "",
    email: "",
    source: "",
    propertyName: "",
    property: null,
    unit: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceRef = useRef(null);
  // Auto-pick allowed property when exactly one is assigned
  useEffect(() => {
    if (user?.type === 'sales-inhouse') {
      const list = Array.isArray(user.allowedProperties) ? user.allowedProperties : [];
      if (list.length === 1) {
        const p = list[0];
        setForm(f=> ({ ...f, property: p._id || p, propertyName: p.name || f.propertyName }));
      }
    }
  }, [user]);
  useEffect(()=> {
    function handler(e){ if(!sourceRef.current?.contains(e.target)) setSourceOpen(false); }
    document.addEventListener('mousedown', handler);
    return ()=> document.removeEventListener('mousedown', handler);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      // Sales-inhouse must select property from list
      if (user?.type === 'sales-inhouse' && !form.property) {
        toastError('Sales Inhouse wajib memilih properti dari daftar');
        setLoading(false);
        return;
      }
      // Optional quick client check: if contact provided, query existing by q
      if (form.contact && form.contact.trim()) {
        const q = encodeURIComponent(form.contact.trim());
        const resCheck = await fetch(`/api/leads?q=${q}&limit=1`);
        const jCheck = await resCheck.json();
        if (jCheck?.success && Array.isArray(jCheck.data)) {
          const exists = jCheck.data.some((it) => (it.contact || "").replace(/[-\s]/g, "") === form.contact.replace(/[-\s]/g, ""));
          if (exists) {
            toastError('Kontak sudah ada');
            setLoading(false);
            return;
          }
        }
      }
      const payload = { ...form };
      if (payload.property) {
        // When property selected from master, ignore raw name for saving
        payload.propertyName = undefined;
      }
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadInAt: payload.leadInAt,
          name: payload.name,
          contact: payload.contact,
          email: payload.email,
          source: payload.source,
          property: payload.property,
          propertyName: payload.property ? undefined : payload.propertyName,
          unit: payload.unit,
        })
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 409 && /Kontak sudah ada/i.test(json.error || "")) {
          toastError('Kontak sudah ada');
          throw new Error(json.error);
        }
        throw new Error(json.error || 'Gagal membuat lead');
      }
  // Emit global event for other components (list) to refresh
  window.dispatchEvent(new CustomEvent('lead:created', { detail: json.data }));
  onCreated?.(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={e=> e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 flex flex-col gap-4 animate-sheet-up sm:animate-scale-in">
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-semibold text-lg">Tambah Lead</h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">✕</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Tanggal Lead Masuk*</label>
            <input
              type="date"
              required
              value={form.leadInAt}
              onChange={(e) =>
                setForm((f) => ({ ...f, leadInAt: e.target.value }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Nama*</label>
            <input required value={form.name} onChange={e=> setForm(f=>({...f, name:e.target.value}))} className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Nama prospek"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Kontak</label>
            <input value={form.contact} onChange={e=> setForm(f=>({...f, contact:e.target.value}))} className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="No. WA"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Email</label>
            <input type="email" value={form.email} onChange={e=> setForm(f=>({...f, email:e.target.value}))} className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="email@example.com"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Proyek</label>
            <PropertyTypeahead
              value={form.propertyName}
              onInput={(val)=> setForm(f=> ({...f, propertyName: val, property: null}))}
              onSelect={(it)=> setForm(f=> ({...f, propertyName: it.name, property: it._id}))}
            />
            {user?.type === 'sales-inhouse' && !form.property && Array.isArray(user.allowedProperties) && user.allowedProperties.length > 1 && (
              <p className="text-[10px] text-amber-600">Pilih salah satu dari proyek yang telah ditetapkan oleh admin.</p>
            )}
            {form.property && <p className="text-[10px] text-green-600">Terpilih dari master</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Unit / Blok</label>
            <input value={form.unit} onChange={e=> setForm(f=>({...f, unit:e.target.value}))} className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Unit / Blok"/>
          </div>
          <div className="flex flex-col gap-1 relative" ref={sourceRef}>
            <label className="text-xs font-medium">Sumber</label>
            <button type="button" onClick={()=> setSourceOpen(o=> !o)} className="relative rounded border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none flex justify-between items-center">
              <span className="truncate text-left">{form.source || 'Pilih sumber'}</span>
              <span className={`transition text-[10px] ${sourceOpen? 'rotate-180':''}`}>▲</span>
            </button>
            {sourceOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-auto z-30 text-sm animate-slide-up">
                {SOURCES.map(s=> (
                  <button type="button" key={s} onClick={()=> { setForm(f=>({...f, source:s})); setSourceOpen(false); }} className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${form.source===s? 'bg-blue-100':''}`}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 text-slate-700 text-sm">Batal</button>
          <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{loading? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}
