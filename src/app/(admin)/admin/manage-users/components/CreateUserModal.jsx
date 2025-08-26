"use client";
import { FaTimes } from "react-icons/fa";
import { USER_TYPES } from "../utils/constants";

export default function CreateUserModal({ open, onClose, form, setForm, onSubmit }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Tambah User</h3>
          <button className="p-1.5 rounded hover:bg-gray-100" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <input className="border rounded-lg px-3 py-2" placeholder="Nama Lengkap" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            <input type="email" className="border rounded-lg px-3 py-2" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            <input className="border rounded-lg px-3 py-2" placeholder="Telepon" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
            <input type="password" className="border rounded-lg px-3 py-2" placeholder="Password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} />
            <select className="border rounded-lg px-3 py-2" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Batal</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={onSubmit}>Simpan</button>
        </div>
      </div>
    </div>
  );
}
