"use client";

import { useAuth } from "@/context/AuthContext";
import AgentView from "./components/AgentView";
import AdminView from "./components/AdminView";

export default function LogActivityPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="p-6 text-center">Memverifikasi peran pengguna...</div>
    );
  }

  // Tentukan tampilan berdasarkan peran (role) pengguna
  const isValidator = user?.role === "superadmin";

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Log Aktivitas
        </h1>
        <p className="mt-1 text-slate-500">
          {isValidator
            ? "Validasi aktivitas yang dilaporkan oleh tim."
            : "Catat aktivitas produksi harian Anda di sini."}
        </p>
      </header>

      {isValidator ? <AdminView /> : <AgentView />}
    </div>
  );
}
