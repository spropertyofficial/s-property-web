"use client";
import { useEffect, useRef, useState } from 'react';
import PropertyTypeahead from "./PropertyTypeahead";
import LeadStatusBadge from './LeadStatusBadge';
import Swal from 'sweetalert2';

const STATUSES = ["Baru","Hot","Warm","Cold","Reservasi","Booking","Closing","No Respond"];
export default function LeadInfoEditModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: lead.name || '',
    contact: lead.contact || '',
    email: lead.email || '',
    status: lead.status,
    unit: lead.unit || '',
    source: lead.source || '',
    propertyName: lead.propertyName || '',
    property: lead.property || null,
  });
  const [sourceOpen, setSourceOpen] = useState(false);
  const sourceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const statusBtnRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click or Escape
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
  const [error, setError] = useState(null);

  async function save(e){
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const statusChanged = lead.status !== form.status;
      // Kirim perubahan field umum (tanpa status) ke endpoint PATCH utama
      const payload = {
        name: form.name,
        contact: form.contact,
        email: form.email,
        unit: form.unit,
        source: form.source,
        property: form.property,
        propertyName: form.property ? undefined : form.propertyName,
      };

      let latestDoc = lead;
      // Lakukan PATCH umum terlebih dahulu
      const res = await fetch(`/api/leads/${lead._id}`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
  body: JSON.stringify(payload)
      });
      const json = await res.json();
      if(!json.success) throw new Error(json.error || 'Gagal menyimpan perubahan');
      latestDoc = json.data || latestDoc;
      window.dispatchEvent(new CustomEvent('lead:updated', { detail: { id: lead._id, fields: payload } }));

      // Jika status berubah, gunakan endpoint khusus agar tervalidasi
      if (statusChanged) {
        const resStatus = await fetch(`/api/leads/${lead._id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ status: form.status })
        });
        const jsonStatus = await resStatus.json();
        if (!jsonStatus.success) throw new Error(jsonStatus.error || 'Gagal memperbarui status');
        latestDoc = jsonStatus.data || latestDoc;
        window.dispatchEvent(new CustomEvent('lead:status', { detail: { id: lead._id, status: form.status } }));
      }

      onSaved?.(latestDoc);
      onClose();
      Swal.fire({ icon:'success', title:'Tersimpan', text:'Informasi lead diperbarui', timer:1600, showConfirmButton:false });
    } catch(e2){
      setError(e2.message);
      Swal.fire({ icon:'error', title:'Gagal', text: e2.message || 'Tidak bisa menyimpan'});
    } finally { setLoading(false);} }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={save} onClick={e=> e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 flex flex-col gap-4 animate-sheet-up sm:animate-scale-in">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Ubah Informasi Lead</h2>
          <button type="button" onClick={onClose} className="text-slate-500">✕</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3">
          <Field label="Nama" required value={form.name} onChange={v=> setForm(f=> ({...f, name:v}))} />
          <Field label="Kontak" value={form.contact} onChange={v=> setForm(f=> ({...f, contact:v}))} />
          <Field label="Email" type="email" value={form.email} onChange={v=> setForm(f=> ({...f, email:v}))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Proyek</label>
            <PropertyTypeahead
              value={form.propertyName}
              onInput={val => setForm(f => ({ ...f, propertyName: val, property: null }))}
              onSelect={it => setForm(f => ({ ...f, propertyName: it.name, property: it._id }))}
            />
            {form.property && <p className="text-[10px] text-green-600">Terpilih dari master</p>}
          </div>
          <Field label="Unit" value={form.unit} onChange={v=> setForm(f=> ({...f, unit:v}))} />
          <div className="flex flex-col gap-1 relative" ref={sourceRef}>
            <label className="text-xs font-medium">Sumber</label>
            <button type="button" onClick={()=> setSourceOpen(o=> !o)} className="relative rounded border border-slate-300 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none flex justify-between items-center">
              <span className="truncate text-left">{form.source || 'Pilih sumber'}</span>
              <span className={`transition text-[10px] ${sourceOpen? 'rotate-180':''}`}>▲</span>
            </button>
            {sourceOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-auto z-30 text-sm animate-slide-up">
                {["Baru", "Hot", "Warm", "Cold", "Reservasi", "Booking", "Closing", "No Respond"].map(s=> (
                  <button type="button" key={s} onClick={()=> { setForm(f=>({...f, source:s})); setSourceOpen(false); }} className={`w-full text-left px-3 py-2 hover:bg-blue-50 ${form.source===s? 'bg-blue-100':''}`}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Status</label>
            <div className="relative">
              <button
                type="button"
                ref={statusBtnRef}
                onClick={()=> setOpenStatus(o=> !o)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm bg-white text-left flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={openStatus}
              >
                <span>{form.status}</span>
                <svg className={`w-4 h-4 transition-transform ${openStatus ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 12a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L10 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 12z" clipRule="evenodd"/></svg>
              </button>
              {openStatus && (
                <ul
                  ref={menuRef}
                  role="listbox"
                  className="absolute bottom-full mb-1 left-0 w-full max-h-48 overflow-y-auto rounded-md border border-slate-300 bg-white shadow-lg z-10"
                >
                  {STATUSES.map(s => (
                    <li
                      key={s}
                      role="option"
                      aria-selected={form.status === s}
                      onClick={()=> { setForm(f=> ({...f, status:s})); setOpenStatus(false);} }
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${form.status===s ? 'bg-blue-50 font-medium' : ''}`}
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
            <div className="mt-1"><LeadStatusBadge status={form.status} /></div>
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

function Field({ label, value, onChange, type='text', required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
      <input required={required} type={type} value={value} onChange={e=> onChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  );
}
