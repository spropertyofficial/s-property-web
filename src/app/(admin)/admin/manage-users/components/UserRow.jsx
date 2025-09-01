"use client";
import { useEffect, useRef, useState } from "react";
import { FaSave, FaTrashAlt, FaKey, FaTimes } from "react-icons/fa";
import { USER_TYPES } from "../utils/constants";
import { toastError, toastSuccess } from "../utils/toast";

export default function UserRow({ user, onChange }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    type: user.type || "user",
    isActive: Boolean(user.isActive),
  });
  const [allowed, setAllowed] = useState(Array.isArray(user.allowedProperties) ? user.allowedProperties.map(p=>({ _id: p._id || p, name: p.name || '' })) : []);
  const [pQuery, setPQuery] = useState("");
  const [pItems, setPItems] = useState([]);
  const [pOpen, setPOpen] = useState(false);
  const pRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(()=>{
    function onDoc(e){ if(!pRef.current?.contains(e.target)) setPOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return ()=> document.removeEventListener('mousedown', onDoc);
  },[]);

  useEffect(()=>{
    if (!pQuery || pQuery.length < 2) { setPItems([]); return; }
    let active = true; const ctl = new AbortController();
    const t = setTimeout(async ()=>{
      try {
        const res = await fetch(`/api/properties/suggest?q=${encodeURIComponent(pQuery)}&limit=10`, { signal: ctl.signal });
        const j = await res.json();
        if (!active) return; setPItems(j?.items||[]);
      } catch { if (active) setPItems([]); }
    }, 300);
    return ()=> { active=false; ctl.abort(); clearTimeout(t); };
  }, [pQuery]);

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form };
      if ((payload.type === 'sales-inhouse') && allowed.length >= 0) {
        payload.allowedProperties = allowed.map(p=>p._id);
      }
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Gagal menyimpan");
      toastSuccess("Perubahan disimpan");
      onChange?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doReset() {
    if (!newPassword || newPassword.length < 6) return toastError('Minimal 6 karakter');
    const res = await fetch(`/api/admin/users/${user._id}/reset-password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data?.success) return toastError(data?.message || 'Gagal reset password');
    setShowReset(false); setNewPassword("");
    toastSuccess('Password direset');
  }

  async function doDelete() {
    const res = await fetch(`/api/admin/users/${user._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data?.success) return toastError(data?.message || 'Gagal menghapus');
    setShowDelete(false);
    toastSuccess('User dihapus');
    onChange?.();
  }

  return (
    <>
      <tr className="border-t hover:bg-gray-50/60">
        <td className="p-3">
          <input className="border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        </td>
        <td className="p-3 text-xs text-gray-700">{user.email}</td>
        <td className="p-3">
          <input className="border rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
        </td>
        <td className="p-3">
          <select className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>
        <td className="p-3 text-xs text-gray-700">{user.agentCode || "-"}</td>
        <td className="p-3">
          {form.type === 'sales-inhouse' ? (
            <div className="space-y-2" ref={pRef}>
              <div className="flex gap-2 flex-wrap">
                {allowed.map(p=> (
                  <span key={p._id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 text-xs">
                    {p.name || p._id}
                    <button type="button" className="text-blue-700/70 hover:text-blue-900" onClick={()=> setAllowed(list=> list.filter(x=>x._id!==p._id))}>×</button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input value={pQuery} onChange={e=>{ setPQuery(e.target.value); setPOpen(true); }} onFocus={()=> setPOpen(true)} placeholder="Tambah proyek..." className="border rounded-lg px-3 py-2 w-72 focus:ring-2 focus:ring-blue-500" />
                {pOpen && (pQuery.length >=2) && (
                  <div className="absolute z-10 bg-white border rounded-md shadow w-full mt-1 max-h-56 overflow-auto">
                    {pItems.length===0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Tidak ada hasil</div>
                    ) : pItems.map(it=> (
                      <button type="button" key={it._id} onClick={()=>{ if(!allowed.find(a=>a._id===it._id)) setAllowed(l=>[...l,{_id:it._id,name:it.name}]); setPQuery(''); setPOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm">
                        {it.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-500">-</span>
          )}
        </td>
        <td className="p-3">
          <button
            onClick={() => setForm(f=>({...f, isActive: !f.isActive}))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-pressed={form.isActive}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <button disabled={saving} onClick={save} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
              <FaSave /> <span>Simpan</span>
            </button>
            <button onClick={()=>setShowReset(true)} className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700">
              <FaKey /> <span>Reset</span>
            </button>
            <button onClick={()=>setShowDelete(true)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
              <FaTrashAlt /> <span>Hapus</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Reset Modal */}
      {showReset && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Reset Password</h3>
              <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => setShowReset(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <input type="password" className="border rounded-lg px-3 py-2 w-full" placeholder="Password baru (min 6)" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
            </div>
            <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setShowReset(false)}>Batal</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={doReset}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Hapus User</h3>
              <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => setShowDelete(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">Yakin hapus <span className="font-medium">{user.email}</span>?</p>
            </div>
            <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setShowDelete(false)}>Batal</button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={doDelete}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
