// src/app/(admin)/admin/manage-admins/page.js
"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminsTable from "./components/AdminsTable";
import CreateAdminModal from "./components/CreateAdminModal";
import { toastError, toastSuccess } from "./utils/toast";

export default function ManageAdmins() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });

  const fetchAdmins = async (signal) => {
    try {
      const res = await fetch("/api/admin/all", { signal, cache: "no-store" });
      const data = await res.json();
      setAdmins(data.admins || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        if (!res.ok) throw new Error("Unauthorized");
        const me = await res.json();
        if (me?.role !== "superadmin") {
          // Centered alert then redirect as requested earlier
          await import("sweetalert2").then(({ default: Swal }) => Swal.fire({ icon: 'error', title: 'Akses ditolak', text: 'Halaman khusus superadmin' }));
          router.replace("/admin");
          return;
        }
        setAuthorized(true);
        const ac = new AbortController();
        fetchAdmins(ac.signal);
        return () => ac.abort();
      } catch (e) {
        router.replace("/admin/login");
      } finally {
        setCheckingRole(false);
      }
    })();
  }, [router]);

  async function submitCreate() {
    if (!form.name || !form.email || !form.password || !form.role) {
      return toastError("Lengkapi semua field");
    }
    try {
      const res = await fetch("/api/admin/create", { method: "POST", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menambah admin");
      toastSuccess("Admin ditambahkan");
      setOpenCreate(false);
      setForm({ name: "", email: "", password: "", role: "" });
      fetchAdmins();
    } catch (e) {
      toastError(e.message);
    }
  }

  if (checkingRole) return <div className="p-6 text-sm text-gray-500">Memeriksa akses...</div>;
  if (!authorized) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Admin</h1>
          <p className="text-sm text-gray-500">Khusus superadmin</p>
        </div>
        <button onClick={()=>setOpenCreate(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Tambah Admin</button>
      </div>

      <AdminsTable items={admins} loading={loading} onChange={()=>fetchAdmins()} />

      <CreateAdminModal open={openCreate} onClose={()=>setOpenCreate(false)} form={form} setForm={setForm} onSubmit={submitCreate} />
    </div>
  );
}
