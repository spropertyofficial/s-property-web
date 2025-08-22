"use client";
import { useState } from 'react';
import LeadStatusBadge from './LeadStatusBadge';
import Swal from 'sweetalert2';

const STATUSES = ["Baru","Hot","Warm","Cold","Reservasi","Booking","Closing","No Respond"];
export default function LeadInfoEditModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState({ name: lead.name||'', contact: lead.contact||'', email: lead.email||'', status: lead.status, unit: lead.unit||'', source: lead.source||'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function save(e){
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      // status via dedicated endpoint if changed, but we can patch together
      const payload = { ...form };
      const res = await fetch(`/api/leads/${lead._id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!json.success) throw new Error(json.error || 'Gagal menyimpan');
      if (lead.status !== form.status) {
        window.dispatchEvent(new CustomEvent('lead:status', { detail: { id: lead._id, status: form.status } }));
      }
      window.dispatchEvent(new CustomEvent('lead:updated', { detail: { id: lead._id, fields: payload } }));
      onSaved?.(json.data);
      onClose();
      Swal.fire({ icon:'success', title:'Tersimpan', text:'Informasi lead diperbarui', timer:1600, showConfirmButton:false });
    } catch(e2){ setError(e2.message); Swal.fire({ icon:'error', title:'Gagal', text: e2.message || 'Tidak bisa menyimpan'});} finally { setLoading(false);} }

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
          <Field label="Unit" value={form.unit} onChange={v=> setForm(f=> ({...f, unit:v}))} />
          <Field label="Sumber" value={form.source} onChange={v=> setForm(f=> ({...f, source:v}))} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Status</label>
            <select value={form.status} onChange={e=> setForm(f=> ({...f, status:e.target.value}))} className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
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
