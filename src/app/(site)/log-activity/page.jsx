"use client";

import { useAuth } from "@/context/AuthContext";
import AgentView from "./components/AgentView";

export default function UserLogActivityPage() {
  const { user, loading, isAgent } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tosca-200 mx-auto mb-6"></div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Memuat Data</h3>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk mengakses halaman ini.
            </p>
            <a
              href="/join-s-pro"
              className="inline-flex items-center bg-tosca-200 text-white px-6 py-3 rounded-lg hover:bg-tosca-300 transition-colors font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login Sekarang
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is an agent
  if (!isAgent()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Akses Terbatas
            </h1>
            <p className="text-gray-600 mb-6">
              Halaman ini hanya tersedia untuk agen. Silakan hubungi admin untuk informasi lebih lanjut.
            </p>
            <a
              href="/"
              className="inline-flex items-center bg-tosca-200 text-white px-6 py-3 rounded-lg hover:bg-tosca-300 transition-colors font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-tosca-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Log Aktivitas Harian
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Catat aktivitas produksi harian Anda untuk tracking performa dan mendapatkan poin produktivitas.
                </p>
              </div>
              <div className="bg-tosca-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-tosca-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <AgentView />
      </div>
    </div>
  );
}
