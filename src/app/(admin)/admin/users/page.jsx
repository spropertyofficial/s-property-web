"use client";
import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaSave, FaTrashAlt, FaKey, FaSearch, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const TYPES = ["user", "agent", "semi-agent", "sales-inhouse"];

export default function AdminManageUsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", password: "", type: "user" });

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (isActive !== "") p.set("isActive", String(isActive));
    p.set("page", String(page));
    p.set("perPage", String(perPage));
    return p.toString();
  }, [q, type, isActive, page, perPage]);

  async function fetchUsers(signal) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?${query}`, { signal, cache: "no-store" });
      const data = await res.json();
      if (data?.success) {
        setItems(data.items);
        setTotal(data.total);
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    fetchUsers(ac.signal);
    return () => ac.abort();
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  async function submitCreate() {
    if (!createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
      return toastError('Lengkapi semua field');
    }
    if (createForm.password.length < 6) return toastError('Password minimal 6 karakter');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createForm)
    });
    const data = await res.json();
    if (!res.ok || !data?.success) return toastError(data?.message || 'Gagal membuat user');
    toastSuccess('User dibuat');
    setShowCreate(false);
    setCreateForm({ name: "", email: "", phone: "", password: "", type: "user" });
    fetchUsers();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header / Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola akun pengguna, agen, dan statusnya.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Cari nama, email, telepon, kode..."
              className="pl-9 pr-3 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tipe</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={isActive}
            onChange={(e) => { const v = e.target.value; setIsActive(v === "" ? "" : v === "true"); setPage(1); }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aktif & Nonaktif</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
            <FaPlus /> Tambah User
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr className="text-left">
                <th className="p-3 font-medium text-gray-600">Nama</th>
                <th className="p-3 font-medium text-gray-600">Email</th>
                <th className="p-3 font-medium text-gray-600">Telepon</th>
                <th className="p-3 font-medium text-gray-600">Tipe</th>
                <th className="p-3 font-medium text-gray-600">Kode Agen</th>
                <th className="p-3 font-medium text-gray-600">Aktif</th>
                <th className="p-3 font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-6 text-center text-gray-500" colSpan={7}>Memuat data...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-6 text-center text-gray-500" colSpan={7}>Tidak ada data</td></tr>
              ) : (
                items.map((u) => (
                  <Row key={u._id} user={u} onChange={() => fetchUsers()} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">Hal {page} dari {Math.max(1, Math.ceil(total / perPage))} • Total {total}</div>
          <div className="space-x-2">
            <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Sebelumnya</button>
            <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={page>=Math.max(1, Math.ceil(total / perPage))} onClick={()=>setPage(p=>p+1)}>Berikutnya</button>
          </div>
        </div>
      </div>
      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Tambah User</h3>
              <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => setShowCreate(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <input className="border rounded-lg px-3 py-2" placeholder="Nama Lengkap" value={createForm.name} onChange={e=>setCreateForm(f=>({...f,name:e.target.value}))} />
                <input type="email" className="border rounded-lg px-3 py-2" placeholder="Email" value={createForm.email} onChange={e=>setCreateForm(f=>({...f,email:e.target.value}))} />
                <input className="border rounded-lg px-3 py-2" placeholder="Telepon" value={createForm.phone} onChange={e=>setCreateForm(f=>({...f,phone:e.target.value}))} />
                <input type="password" className="border rounded-lg px-3 py-2" placeholder="Password" value={createForm.password} onChange={e=>setCreateForm(f=>({...f,password:e.target.value}))} />
                <select className="border rounded-lg px-3 py-2" value={createForm.type} onChange={e=>setCreateForm(f=>({...f,type:e.target.value}))}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setShowCreate(false)}>Batal</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={submitCreate}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toastSuccess(text) {
  return Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: text, showConfirmButton: false, timer: 1500 });
}
function toastError(text) {
  return Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: text, showConfirmButton: false, timer: 2000 });
}

function Row({ user, onChange }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    type: user.type || "user",
    isActive: Boolean(user.isActive),
  });
  const [saving, setSaving] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </td>
        <td className="p-3 text-xs text-gray-700">{user.agentCode || "-"}</td>
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
      <RowModals
        showReset={showReset}
        setShowReset={setShowReset}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        doReset={doReset}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        doDelete={doDelete}
        email={user.email}
      />
    </>
  );
}

// Row Modals
function RowModals({ showReset, setShowReset, newPassword, setNewPassword, doReset, showDelete, setShowDelete, doDelete, email }) {
  return (
    <>
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
              <p className="text-sm text-gray-600">Yakin hapus <span className="font-medium">{email}</span>?</p>
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
