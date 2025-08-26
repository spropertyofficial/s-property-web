"use client";
import { useEffect, useMemo, useState } from "react";
import FiltersBar from "./components/FiltersBar";
import UsersTable from "./components/UsersTable";
import CreateUserModal from "./components/CreateUserModal";
import { toastError, toastSuccess } from "./utils/toast";

export default function AdminManageUsersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500">Kelola akun pengguna, agen, dan statusnya.</p>
        </div>
        <FiltersBar
          q={q}
          setQ={(v)=>{ setQ(v); setPage(1); }}
          type={type}
          setType={(v)=>{ setType(v); setPage(1); }}
          isActive={isActive}
          setIsActive={(v)=>{ setIsActive(v); setPage(1); }}
          perPage={perPage}
          setPerPage={(v)=>{ setPerPage(v); setPage(1); }}
          onAdd={() => setShowCreate(true)}
        />
      </div>

      <UsersTable
        items={items}
        loading={loading}
        onChange={() => fetchUsers()}
        page={page}
        perPage={perPage}
        total={total}
        setPage={setPage}
      />

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={submitCreate}
      />
    </div>
  );
}

// (Removed temporary redirect to avoid duplicate default export)
