"use client";
import AdminRow from "./AdminRow";

export default function AdminsTable({ items, loading, onChange }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr className="text-left">
              <th className="p-3 font-medium text-gray-600">Nama</th>
              <th className="p-3 font-medium text-gray-600">Email</th>
              <th className="p-3 font-medium text-gray-600">Role</th>
              <th className="p-3 font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={4}>Memuat data...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-6 text-center text-gray-500" colSpan={4}>Tidak ada data</td></tr>
            ) : (
              items.map((a) => (
                <AdminRow key={a._id} admin={a} onChange={onChange} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
