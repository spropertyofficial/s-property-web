"use client";
import LeadStatusBadge from "./LeadStatusBadge";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";

export default function LeadCard({ lead, onClick, onQuickOpen, index = 0 }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    const resConfirm = await Swal.fire({
      title: 'Hapus lead?',
      text: lead.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626'
    });
    if (!resConfirm.isConfirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, { method: "DELETE" });
      const json = await res.json();
  if (!json.success) throw new Error(json.error || "Gagal hapus");
      window.dispatchEvent(
        new CustomEvent("lead:deleted", { detail: { id: lead._id } })
      );
  Swal.fire({ icon:'success', title:'Terhapus', text:'Lead dihapus', timer:1300, showConfirmButton:false });
    } catch (e2) {
  Swal.fire({ icon:'error', title:'Gagal', text: e2.message || 'Tidak bisa menghapus lead' });
    } finally {
      setDeleting(false);
    }
  }
  // Determine property display name prioritizing populated name, then typed propertyName, while avoiding exposing raw Mongo ObjectId
  let propertyLabel = lead.property?.name || lead.propertyName;
  if (!propertyLabel && typeof lead.property === 'string' && !/^[0-9a-fA-F]{24}$/.test(lead.property)) {
    propertyLabel = lead.property; // fallback if it's a human readable string, not an ObjectId
  }
  return (
    <div
      className="group relative w-full animate-fade-in-up will-change-transform"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <Link
        href={`/leads/${lead._id}`}
        className="cursor-pointer w-full text-left rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col gap-1 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm line-clamp-1 pr-6">{lead.name}</h3>
        <LeadStatusBadge status={lead.status} />
      </div>
      {propertyLabel && (
        <p className="text-xs text-slate-500 line-clamp-1">
          Properti: {propertyLabel}
          {lead.unit ? ` • ${lead.unit}` : ""}
        </p>
      )}
      {lead.contact && (
        <p className="text-xs text-slate-500">📞 {lead.contact}</p>
      )}
      <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
        <p>
          Tanggal Lead Masuk: {new Date(lead.leadInAt || lead.createdAt).toLocaleDateString()}
        </p>
        <p>
          Tanggal Ditambahkan: {new Date(lead.createdAt).toLocaleDateString()}
        </p>
      </div>
      </Link>
      {/* Actions container at bottom-right: quick edit and delete */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <button
          title="Edit cepat"
          onMouseDown={(e)=> { e.preventDefault(); e.stopPropagation(); }}
          onClick={(e)=> { e.preventDefault(); e.stopPropagation(); onQuickOpen?.(lead); }}
          className="p-1 rounded bg-white/90 backdrop-blur hover:bg-red-50 text-slate-500 hover:text-red-600 transition border border-slate-200 text-xs font-bold h-6 w-6 flex items-center justify-center"
        >
          !
        </button>
        <button
          title="Hapus"
          onMouseDown={(e)=> { e.preventDefault(); e.stopPropagation(); }}
          onClick={handleDelete}
          className="p-1 rounded bg-white/90 backdrop-blur hover:bg-red-50 text-slate-500 hover:text-red-600 transition border border-slate-200"
        >
          {deleting ? (
            <span className="animate-pulse text-[10px] px-1">...</span>
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
