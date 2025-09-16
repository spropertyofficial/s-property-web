"use client";
import UserRow from "./UserRow";

export default function UsersTable({ items, loading, onChange, page, perPage, total, setPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return (
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
              <th className="p-3 font-medium text-gray-600">Proyek Diizinkan</th>
              <th className="p-3 font-medium text-gray-600">Aktif</th>
              <th className="p-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={8}>Memuat data...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={8}>Tidak ada data</td></tr>
            ) : (
              items.map((u) => (
                <UserRow key={u._id} user={u} onChange={onChange} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <div className="text-sm text-gray-600">Hal {page} dari {totalPages} • Total {total}</div>
        <div className="space-x-2">
          <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Sebelumnya</button>
          <button className="px-3 py-1.5 border rounded-lg text-sm hover:bg-white disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Berikutnya</button>
        </div>
      </div>
    </div>
  );
}
