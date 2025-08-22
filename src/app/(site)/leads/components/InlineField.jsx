"use client";
import { useState } from 'react';

export default function InlineField({ id, field, label, value:initial, type='text', textarea=false, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(initial || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function save(){
    if (val === initial) { setEditing(false); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/leads/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ [field]: (val===''? null : val) }) });
      const json = await res.json();
      if(!json.success) throw new Error(json.error || 'Gagal menyimpan');
      onSaved?.(json.data);
      window.dispatchEvent(new CustomEvent('lead:updated', { detail: { id, field, value: val } }));
      setEditing(false);
    } catch(e){ setError(e.message);} finally { setLoading(false);} }

  function cancel(){ setVal(initial || ''); setEditing(false); setError(null); }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 uppercase">{label}</span>
        {!editing && <button type="button" onClick={()=> setEditing(true)} className="text-[10px] text-blue-600">Edit</button>}
      </div>
      {!editing && (
        <div className="text-sm min-h-[20px] whitespace-pre-wrap">{initial? initial : <span className="text-slate-400">-</span>}</div>
      )}
      {editing && (
        <div className="space-y-2">
          {textarea ? (
            <textarea value={val} onChange={e=> setVal(e.target.value)} rows={4} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          ) : (
            <input type={type} value={val} onChange={e=> setVal(e.target.value)} className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          )}
          {error && <p className="text-[11px] text-red-600">{error}</p>}
          <div className="flex gap-2 text-xs">
            <button disabled={loading} onClick={save} className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50">{loading? 'Menyimpan...' : 'Simpan'}</button>
            <button disabled={loading} onClick={cancel} className="px-3 py-1 rounded bg-slate-200">Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}
