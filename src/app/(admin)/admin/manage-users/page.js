// src/app/(admin)/admin/manage-users/page.js
"use client";
import { useEffect, useState } from "react";

export default function ManageUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch admin list
  const fetchAdmins = async () => {
    const res = await fetch("/api/admin/all");
    const data = await res.json();
    setAdmins(data.admins || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Hapus admin ini?")) return;
    const res = await fetch(`/api/admin/delete/${id}`, { method: "DELETE" });
    const data = await res.json();
    setMessage(data.message);
    fetchAdmins(); // refresh
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">Daftar Admin</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border text-left text-sm">
          <thead>
            <tr className="border-b">
              {/* PERUBAHAN: Tambah kolom Nama */}
              <th className="p-2">Nama</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                {/* PERUBAHAN: Tambah input untuk Nama */}
                <td>
                  <input
                    type="text"
                    defaultValue={admin.name}
                    onChange={(e) => (admin.name = e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td>
                  <input
                    type="email"
                    defaultValue={admin.email}
                    readOnly
                    className="border px-2 py-1 rounded w-full bg-gray-100"
                  />
                </td>
                <td>
                  <select
                    defaultValue={admin.role}
                    onChange={(e) => (admin.role = e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="superadmin">Superadmin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="space-x-2">
                  <button
                    onClick={() => {
                      const newPassword = prompt("Masukkan password baru:");
                      if (newPassword) {
                        fetch("/api/admin/reset-password", {
                          method: "POST",
                          body: JSON.stringify({
                            userId: admin._id,
                            newPassword,
                          }),
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            alert(data.message);
                          });
                      }
                    }}
                    className="text-blue-500 underline text-sm"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      const confirmDelete = confirm(
                        `Yakin hapus user ${admin.email}?`
                      );
                      if (confirmDelete) {
                        fetch(`/api/admin/delete-user/${admin._id}`, {
                          method: "DELETE",
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            alert(data.message);
                            fetchAdmins(); // refresh data
                          });
                      }
                    }}
                    className="text-red-500 underline text-sm"
                  >
                    Hapus
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/admin/update-user", {
                        method: "POST",
                        body: JSON.stringify({
                          userId: admin._id,
                          name: admin.name,
                          role: admin.role,
                        }),
                      });
                      const data = await res.json();
                      setMessage(data.message);
                      fetchAdmins();
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Simpan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 className="text-lg font-semibold mt-10 mb-2">Tambah User Baru</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target;
          const res = await fetch("/api/admin/create", {
            method: "POST",
            body: JSON.stringify({
              name: form.name.value,
              email: form.email.value,
              password: form.password.value,
              role: form.role.value,
            }),
          });

          const data = await res.json();
          setMessage(data.message);
          form.reset();
          fetchAdmins();
        }}
        className="space-y-4 max-w-sm"
      >
        <input
          name="name"
          type="text"
          placeholder="Nama Lengkap"
          className="border p-2 w-full"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 w-full"
          required
        />
        <select name="role" className="border p-2 w-full" required>
          <option value="">Pilih Role</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tambah User
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
