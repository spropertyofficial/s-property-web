"use client";

import AdminView from "./components/AdminView";

export default function AdminLogActivityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                  Log Aktivitas - Admin Panel
                </h1>
                <p className="text-slate-600 max-w-2xl">
                  Validasi dan monitor semua aktivitas yang dilaporkan oleh tim agen.
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </header>

        <AdminView />
      </div>
    </div>
  );
}
