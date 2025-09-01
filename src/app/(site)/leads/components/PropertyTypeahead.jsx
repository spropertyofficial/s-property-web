"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PropertyTypeahead({ value, onSelect, onInput }) {
  const { user } = useAuth();
  const [q, setQ] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  useEffect(()=> { setQ(value || ""); }, [value]);

  useEffect(()=> {
  if (!q || q.length < 2) { setItems([]); return; }
    let active = true;
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
  const res = await fetch(`/api/properties/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const json = await res.json();
        if (!active) return;
        if (json.success) setItems(json.data || []); else setItems([]);
      } catch { if (active) setItems([]); }
      finally { if (active) setLoading(false); }
    }, 300);
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [q]);

  useEffect(()=> {
    function onDoc(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        value={q}
        onChange={e=> { setQ(e.target.value); onInput?.(e.target.value); setOpen(true); }}
        onFocus={()=> setOpen(true)}
        placeholder={user?.type === 'sales-inhouse' ? 'Cari nama proyek (wajib pilih dari daftar)' : 'Nama proyek atau ketik baru'}
        className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none w-full"
      />
      {open && (q.length >= 2 || loading) && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-auto z-20 text-sm animate-slide-up">
          {loading && <div className="p-2 text-slate-500">Mencari...</div>}
          {!loading && items.length === 0 && (
            <div className="p-2 text-slate-400">
              {user?.type === 'sales-inhouse' ? (
                <span>Tidak ada hasil yang sesuai. Hubungi admin bila proyek belum ditetapkan.</span>
              ) : (
                <span>Tidak ada hasil. Enter untuk pakai input.</span>
              )}
            </div>
          )}
          {!loading && items.map(it => (
            <button type="button" key={it._id} onClick={()=> { onSelect?.(it); setOpen(false); }} className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2">
              <span className="font-medium">{it.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
