"use client";

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useAdmin } from "@/hooks/useAdmin";

function useCurrency() {
  return useMemo(() => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }), []);
}

function SalesRecordForm({ open, onClose, onSaved, edit }) {
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [form, setForm] = useState(() => ({
    agentId: "",
    projectId: "",
    projectName: "",
    block: "",
    unitType: "",
    status: "Closed",
    tanggalClosing: "",
    hargaPropertiTerjual: "",
    notes: "",
    assetTypeId: "",
  }));
  const [projOptions, setProjOptions] = useState([]);
  const [projTypingTimer, setProjTypingTimer] = useState(null);

  useEffect(() => {
    if (!open) return;
    // load agents
    fetch("/api/users/agents")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAgents(res.items || []);
      })
      .catch(console.error);
    // load asset types
    fetch("/api/asset-types")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setAssetTypes(res.items || []);
      })
      .catch(console.error);
  }, [open]);

  useEffect(() => {
    if (edit && open) {
      const r = edit;
      const toId = (v) => (v && typeof v === "object" ? (v._id || "") : (v || ""));
      const toName = (v) => {
        if (!v) return "";
        if (typeof v === "object") return v.name || "";
        return "";
      };
      setForm({
        agentId: toId(r.agentId),
        projectId: toId(r.projectId),
        projectName: r.projectName || toName(r.projectId) || "",
        block: r.block || "",
        unitType: r.unitType || "",
        status: r.status || "Closed",
        tanggalClosing: r.tanggalClosing ? new Date(r.tanggalClosing).toISOString().slice(0, 10) : "",
        hargaPropertiTerjual: r.hargaPropertiTerjual ?? "",
        notes: r.notes || "",
        assetTypeId: toId(r.assetTypeId),
      });
      // If only an ID is present and name is empty, fetch property details to show project name
      const pid = toId(r.projectId);
      const hasName = Boolean(r.projectName || toName(r.projectId));
      if (pid && !hasName) {
        (async () => {
          try {
            const resp = await fetch(`/api/properties/${pid}`);
            const data = await resp.json();
            if (data?.success && data.property) {
              setForm((f) => ({
                ...f,
                projectName: f.projectName || data.property.name || "",
                assetTypeId: f.assetTypeId || data.property.assetType?._id || f.assetTypeId,
              }));
            }
          } catch (_) {
            // ignore
          }
        })();
      }
    } else if (open) {
      setForm({ agentId: "", projectId: "", projectName: "", block: "", unitType: "", status: "Closed", tanggalClosing: "", hargaPropertiTerjual: "", notes: "", assetTypeId: "" });
    }
  }, [edit, open]);

  const onSubmit = async (e) => {
    e.preventDefault();
    // Confirm save
    const result = await Swal.fire({
      title: edit ? "Simpan Perubahan?" : "Simpan Data?",
      text: edit ? "Perubahan akan disimpan." : "Data penjualan baru akan ditambahkan.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const payload = {
        agentId: form.agentId,
  projectId: form.projectId || undefined,
  projectName: form.projectId ? undefined : (form.projectName?.trim() || undefined),
        block: form.block?.trim() || undefined,
        unitType: form.unitType?.trim() || undefined,
        status: form.status,
        tanggalClosing: form.tanggalClosing ? new Date(form.tanggalClosing).toISOString() : undefined,
        hargaPropertiTerjual: Number(form.hargaPropertiTerjual || 0),
        notes: form.notes?.trim() || undefined,
  assetTypeId: form.assetTypeId || undefined,
      };
      const res = await fetch(edit? `/api/sales-records/${edit._id}` : "/api/sales-records", {
        method: edit? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Gagal menyimpan");
      await Swal.fire({
        title: "Berhasil",
        text: edit ? "Perubahan tersimpan." : "Data berhasil ditambahkan.",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 1800,
        showConfirmButton: false,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      Swal.fire({ title: "Gagal", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 mx-4 max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{edit? "Edit Penjualan" : "Tambah Penjualan"}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Agen</label>
            {edit ? (
              <div className="w-full border rounded p-2 bg-slate-50">
                {(function(){
                  const ag = (edit.agentId && typeof edit.agentId === 'object') ? edit.agentId : agents.find(a=>a._id===form.agentId);
                  return ag ? `${ag.name}${ag.agentCode ? ` (${ag.agentCode})` : ''}` : '-';
                })()}
              </div>
            ) : (
              <select className="w-full border rounded p-2" value={form.agentId} onChange={(e)=>setForm((f)=>({...f, agentId:e.target.value}))} required>
                <option value="">- Pilih Agen -</option>
                {agents.map(a => (
                  <option key={a._id} value={a._id}>{a.name}{a.agentCode? ` (${a.agentCode})`: ""}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Proyek</label>
            <input
              className="w-full border rounded p-2"
              value={form.projectName}
              onChange={(e) => {
                if (edit) return; // lock project editing
                const val = e.target.value;
                setForm((f) => ({ ...f, projectName: val, projectId: "" }));
                if (projTypingTimer) clearTimeout(projTypingTimer);
                const t = setTimeout(async () => {
                  if (!edit && val && val.length >= 2) {
                    try {
                      const r = await fetch(`/api/properties/suggest?q=${encodeURIComponent(val)}`);
                      const d = await r.json();
                      if (d.success) setProjOptions(d.items || []);
                    } catch (err) { /* noop */ }
                  } else {
                    setProjOptions([]);
                  }
                }, 350);
                setProjTypingTimer(t);
              }}
              placeholder="Ketik nama proyek..."
              readOnly={!!edit}
            />
            {!edit && projOptions.length > 0 && (
              <div className="mt-1 border rounded max-h-56 overflow-auto bg-white shadow">
                {projOptions.map((p) => (
                  <button
                    type="button"
                    key={p._id}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50"
                    onClick={() => {
                      setForm((f) => ({ ...f, projectId: p._id, projectName: p.name, assetTypeId: p.assetTypeId || f.assetTypeId }));
                      setProjOptions([]);
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-1">Jika tidak ada di daftar, biarkan kosong dan isi nama proyeknya.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Block</label>
              <input className="w-full border rounded p-2" value={form.block} onChange={(e)=>setForm((f)=>({...f, block:e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipe Unit</label>
              <input className="w-full border rounded p-2" value={form.unitType} onChange={(e)=>setForm((f)=>({...f, unitType:e.target.value}))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Tipe Aset</label>
            <select className="w-full border rounded p-2" value={form.assetTypeId} onChange={(e)=>setForm((f)=>({...f, assetTypeId:e.target.value}))}>
              <option value="">- Pilih tipe aset -</option>
              {assetTypes.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Status</label>
              <select className="w-full border rounded p-2" value={form.status} onChange={(e)=>setForm((f)=>({...f, status:e.target.value}))}>
                <option>Closed</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Tanggal Closing</label>
              <input type="date" className="w-full border rounded p-2" value={form.tanggalClosing} onChange={(e)=>setForm((f)=>({...f, tanggalClosing:e.target.value}))} required={form.status === "Closed"} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Harga Properti Terjual</label>
            <input type="number" min={0} className="w-full border rounded p-2" value={form.hargaPropertiTerjual} onChange={(e)=>setForm((f)=>({...f, hargaPropertiTerjual:e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Catatan</label>
            <textarea className="w-full border rounded p-2" rows={3} value={form.notes} onChange={(e)=>setForm((f)=>({...f, notes:e.target.value}))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 rounded border" onClick={onClose} disabled={loading}>Batal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SalesRecordsPage() {
  const currency = useCurrency();
  const { admin } = useAdmin();
  const isViewer = admin && admin.role === "viewer";
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [q, setQ] = useState("");
  const [agents, setAgents] = useState([]);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);

  // preload agents for filter
  useEffect(() => {
    fetch("/api/users/agents").then(r=>r.json()).then(res=>{ if(res.success) setAgents(res.items||[]); }).catch(console.error);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period) params.set("period", period);
      if (status) params.set("status", status);
      if (agentId) params.set("agentId", agentId);
      if (q) params.set("q", q);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await fetch(`/api/sales-records?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [period, status, agentId, q, page, limit]);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Laporan Penjualan</h1>
          <p className="text-slate-500">Kelola transaksi untuk KPI Performance.</p>
          {isViewer && (
            <p className="text-xs text-amber-600 mt-1">Mode read-only: Role Anda viewer. Hubungi admin untuk akses edit.</p>
          )}
        </div>
        <div>
          {!isViewer && (
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>{ setEdit(null); setShowForm(true); }}>Tambah</button>
          )}
        </div>
      </header>

      <section className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm">Periode</label>
            <input type="month" value={period} onChange={(e)=>{ setPage(1); setPeriod(e.target.value); }} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm">Status</label>
            <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} className="w-full border rounded p-2">
              <option value="">Semua</option>
              <option>Closed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Agen</label>
            <select value={agentId} onChange={(e)=>{ setPage(1); setAgentId(e.target.value); }} className="w-full border rounded p-2">
              <option value="">Semua</option>
              {agents.map(a => (
                <option key={a._id} value={a._id}>{a.name}{a.agentCode? ` (${a.agentCode})`: ""}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm">Cari</label>
            <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} placeholder="Proyek, block, unit type, catatan" className="w-full border rounded p-2" />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-6">Memuat...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-2 border">Tanggal</th>
                <th className="p-2 border">Agen</th>
                <th className="p-2 border">Proyek</th>
                <th className="p-2 border">Block</th>
                <th className="p-2 border">Tipe</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border text-right">Harga</th>
                <th className="p-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="p-2 border">{r.tanggalClosing? new Date(r.tanggalClosing).toLocaleDateString("id-ID") : "-"}</td>
                  <td className="p-2 border">{r.agentId?.name || r.agent?.name || r.agentName || "-"}</td>
                  <td className="p-2 border">{r.projectName || r.projectId?.name || "-"}</td>
                  <td className="p-2 border">{r.block || "-"}</td>
                  <td className="p-2 border">{r.unitType || "-"}</td>
                  <td className="p-2 border">{r.status}</td>
                  <td className="p-2 border text-right">{currency.format(r.hargaPropertiTerjual || 0)}</td>
                  <td className="p-2 border text-center space-x-2">
                    {!isViewer && (
                      <>
                        <button className="px-3 py-1 rounded border" onClick={()=>{ setEdit(r); setShowForm(true); }}>Edit</button>
                        <button
                          className="px-3 py-1 rounded border text-red-600"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: "Hapus Data?",
                              text: "Tindakan ini tidak dapat dibatalkan.",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Ya, Hapus",
                              cancelButtonText: "Batal",
                              confirmButtonColor: "#dc2626",
                              cancelButtonColor: "#6b7280",
                            });
                            if (!result.isConfirmed) return;
                            const res = await fetch(`/api/sales-records/${r._id}`, { method: "DELETE" });
                            const d = await res.json();
                            if (!d.success) {
                              return Swal.fire({ title: "Gagal", text: d.error || "Gagal menghapus", icon: "error" });
                            }
                            await Swal.fire({ title: "Terhapus", text: "Data berhasil dihapus.", icon: "success" });
                            fetchData();
                          }}
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} className="p-4 text-center text-slate-500">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between p-3">
          <div className="text-sm text-slate-500">Total: {total}</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded border" onClick={()=>setPage((p)=>Math.max(1, p-1))} disabled={page<=1}>Prev</button>
            <span className="text-sm">{page} / {pageCount}</span>
            <button className="px-3 py-1 rounded border" onClick={()=>setPage((p)=>Math.min(pageCount, p+1))} disabled={page>=pageCount}>Next</button>
          </div>
        </div>
      </section>

      <SalesRecordForm open={showForm} onClose={()=>setShowForm(false)} onSaved={()=>fetchData()} edit={edit} />
    </div>
  );
}
