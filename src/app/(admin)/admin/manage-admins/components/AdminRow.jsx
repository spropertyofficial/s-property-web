"use client";
import { useState } from "react";
import { FaSave, FaTrashAlt, FaKey, FaTimes } from "react-icons/fa";
import { ADMIN_ROLES } from "../utils/constants";
import { toastError, toastSuccess } from "../utils/toast";

export default function AdminRow({ admin, onChange }) {
  const [form, setForm] = useState({
    name: admin.name || "",
    role: admin.role || "viewer",
  });
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        body: JSON.stringify({ userId: admin._id, name: form.name, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menyimpan");
      toastSuccess("Admin diperbarui");
      onChange?.();
    } catch (e) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doReset() {
    if (!newPassword || newPassword.length < 6) return toastError("Minimal 6 karakter");
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      body: JSON.stringify({ userId: admin._id, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return toastError(data?.message || "Gagal reset password");
    setShowReset(false); setNewPassword("");
    toastSuccess("Password direset");
  }

  async function doDelete() {
    const res = await fetch(`/api/admin/delete-user/${admin._id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toastError(data?.message || "Gagal menghapus");
    setShowDelete(false);
    toastSuccess("Admin dihapus");
    onChange?.();
  }

  return (
    <>
      <tr className="border-t hover:bg-gray-50/60">
        <td className="p-3">
          <input className="border rounded-lg px-3 py-2 w-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        </td>
        <td className="p-3 text-xs text-gray-700">{admin.email}</td>
        <td className="p-3">
          <select className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" defaultValue={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
            {ADMIN_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
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
              <h3 className="font-semibold text-gray-900">Hapus Admin</h3>
              <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => setShowDelete(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">Yakin hapus <span className="font-medium">{admin.email}</span>?</p>
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
