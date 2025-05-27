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
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">Daftar Admin</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td>
                  <input
                    type="text"
                    defaultValue={admin.email}
                    onChange={(e) => (admin.email = e.target.value)}
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td>
                  <select
                    defaultValue={admin.role}
                    onChange={(e) => (admin.role = e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="superadmin">superadmin</option>
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
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
                        fetch("/api/admin/delete-user", {
                          method: "POST",
                          body: JSON.stringify({ userId: admin._id }),
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
                          email: admin.email,
                          role: admin.role,
                        }),
                      });
                      const data = await res.json();
                      setMessage(data.message);
                      fetchAdmins(); // refresh data
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
