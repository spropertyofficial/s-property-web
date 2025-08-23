"use client";
import { useState } from "react";
import LeadsList from "./components/LeadsList";
import LeadCreateModal from "./components/LeadCreateModal";
import { Plus } from "lucide-react";

export default function LeadsPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4 max-w-3xl mx-auto h-screen">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Leads</h1>
      </header>
      <LeadsList onCreate={() => setOpen(true)} />
      <button
        aria-label="Tambah Lead"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 rounded-full w-14 h-14 flex items-center justify-center bg-teal-500 text-white shadow-lg shadow-blue-600/40 hover:bg-blue-500 active:scale-95 transition"
      >
        <Plus size={28} />
      </button>
      {open && (
        <LeadCreateModal
          onClose={() => setOpen(false)}
          onCreated={() => setOpen(false)}
        />
      )}
    </div>
  );
}
