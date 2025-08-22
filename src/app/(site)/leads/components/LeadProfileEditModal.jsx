"use client";
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function LeadProfileEditModal({ lead, onClose, onSaved }) {
  const [form, setForm] = useState({
    umur: lead.umur||'',
    pekerjaan: lead.pekerjaan||'',
    statusPernikahan: lead.statusPernikahan||'',
    anggaran: lead.anggaran||'',
    tujuanMembeli: lead.tujuanMembeli||'',
    caraPembayaran: lead.caraPembayaran||'',
    lokasiKlien: lead.lokasiKlien||'',
    lokasiDiinginkan: lead.lokasiDiinginkan||'',
    minatKlien: lead.minatKlien||'',
    catatan: lead.catatan||''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function updateField(k, v){ setForm(f=> ({...f, [k]: v})); }

  async function save(e){
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload = { ...form };
      // convert number fields
      if (payload.umur === '') delete payload.umur; else payload.umur = Number(payload.umur);
      if (payload.anggaran === '') delete payload.anggaran; else payload.anggaran = Number(payload.anggaran);
      const res = await fetch(`/api/leads/${lead._id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const json = await res.json();
      if(!json.success) throw new Error(json.error || 'Gagal menyimpan');
      window.dispatchEvent(new CustomEvent('lead:updated', { detail: { id: lead._id, fields: payload } }));
      onSaved?.(json.data);
      onClose();
      Swal.fire({ icon:'success', title:'Tersimpan', text:'Profil lead diperbarui', timer:1600, showConfirmButton:false });
    } catch(e2){ setError(e2.message); Swal.fire({ icon:'error', title:'Gagal', text: e2.message || 'Tidak bisa menyimpan'});} finally { setLoading(false);} }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <form onSubmit={save} onClick={e=> e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-xl sm:rounded-xl p-5 flex flex-col gap-4 animate-sheet-up sm:animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Ubah Profil Lead</h2>
          <button type="button" onClick={onClose} className="text-slate-500">✕</button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid gap-3">
          <Field label="Umur" type="number" value={form.umur} onChange={v=> updateField('umur', v)} />
          <Field label="Pekerjaan" value={form.pekerjaan} onChange={v=> updateField('pekerjaan', v)} />
          <Field label="Status Pernikahan" value={form.statusPernikahan} onChange={v=> updateField('statusPernikahan', v)} />
          <Field label="Anggaran" type="number" value={form.anggaran} onChange={v=> updateField('anggaran', v)} />
          <Field label="Tujuan Membeli" textarea value={form.tujuanMembeli} onChange={v=> updateField('tujuanMembeli', v)} />
          <Field label="Cara Pembayaran" value={form.caraPembayaran} onChange={v=> updateField('caraPembayaran', v)} />
          <Field label="Lokasi Klien" value={form.lokasiKlien} onChange={v=> updateField('lokasiKlien', v)} />
          <Field label="Lokasi Diinginkan" value={form.lokasiDiinginkan} onChange={v=> updateField('lokasiDiinginkan', v)} />
          <Field label="Minat Klien" textarea value={form.minatKlien} onChange={v=> updateField('minatKlien', v)} />
          <Field label="Catatan" textarea value={form.catatan} onChange={v=> updateField('catatan', v)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 text-slate-700 text-sm">Batal</button>
          <button disabled={loading} type="submit" className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50">{loading? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type='text', textarea }) {
  if (textarea) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium">{label}</label>
        <textarea value={value} onChange={e=> onChange(e.target.value)} rows={3} className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium">{label}</label>
      <input type={type} value={value} onChange={e=> onChange(e.target.value)} className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
    </div>
  );
}
