"use client";
import { FaSearch, FaPlus } from "react-icons/fa";
import { USER_TYPES, PER_PAGE_OPTIONS } from "../utils/constants";

export default function FiltersBar({ q, setQ, type, setType, isActive, setIsActive, perPage, setPerPage, onAdd }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); }}
          placeholder="Cari nama, email, telepon, kode..."
          className="pl-9 pr-3 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <select
        value={type}
        onChange={(e) => { setType(e.target.value); }}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Semua Tipe</option>
        {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <select
        value={isActive}
        onChange={(e) => { const v = e.target.value; setIsActive(v === "" ? "" : v === "true"); }}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Aktif & Nonaktif</option>
        <option value="true">Aktif</option>
        <option value="false">Nonaktif</option>
      </select>
      <select
        value={perPage}
        onChange={(e) => { setPerPage(Number(e.target.value)); }}
        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      >
        {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button onClick={onAdd} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm">
        <FaPlus /> Tambah User
      </button>
    </div>
  );
}
