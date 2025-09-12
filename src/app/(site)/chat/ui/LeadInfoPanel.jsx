"use client";
import { useState } from "react";
import LeadInfoEditModal from "@/app/(site)/leads/components/LeadInfoEditModal";
import LeadProfileEditModal from "@/app/(site)/leads/components/LeadProfileEditModal";

export default function LeadInfoPanel({ conversation, onToggleAssign }){
  // State for modal edit
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
    const [lead, setLead] = useState(conversation?.lead || null); // Ensure lead is not null

  if (!conversation) {
    return (
      <div className="h-full grid place-items-center text-slate-400 p-4 text-center">
        <div>
          <div className="text-4xl mb-4">👤</div>
          <div className="font-bold">Informasi Lead</div>
        </div>
      </div>
    );
  }
  
    if (!conversation.lead) {
      return (
        <div className="h-full grid place-items-center text-slate-400 p-4 text-center">
          <div>
            <div className="text-4xl mb-4">👤</div>
            <div className="font-bold">Informasi Lead</div>
          </div>
        </div>
      );
    }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <div className="font-medium text-slate-900">Detail Prospek</div>
          <div className="text-xs text-slate-500">Ringkasan CRM</div>
        </div>
      </div>

      {/* Avatar and Name at top */}
      <div className="p-4 bg-slate-50 rounded-lg flex items-center mb-2">
        <div className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xl mr-4">
          {getInitials(lead?.name || '')}
        </div>
        <div>
          <p className="font-bold text-lg">{lead?.name || '-'}</p>
          <p className="text-sm text-slate-500">{lead?.phone || '-'}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Info Lead */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Informasi Lead</h2>
            <button onClick={() => setShowInfoModal(true)} className="text-xs px-3 py-1 rounded bg-teal-600 text-white">Ubah</button>
          </div>
          <div className="bg-white rounded-lg border p-4 grid gap-2 text-sm">
              <Field label="Nama" value={lead.name || '-'} />
              <Field label="Kontak" value={lead.contact || '-'} />
              <Field label="Email" value={lead.email || '-'} />
              <Field label="Status" value={lead.status || '-'} />
              <Field label="Properti" value={lead.property?.name || lead.propertyName || '-'} />
              <Field label="Unit" value={lead.unit || '-'} />
              <Field label="Sumber" value={lead.source || '-'} />
              <Field label="Tanggal Lead Masuk" value={lead.leadInAt ? new Date(lead.leadInAt).toLocaleDateString() : lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"} />
              <Field label="Tanggal Ditambahkan" value={lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"} />
              <Field label="Diperbarui" value={lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "-"} />
          </div>
        </section>

        {/* Profil Lead */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Profil Lead</h2>
            <button onClick={() => setShowProfileModal(true)} className="text-xs px-3 py-1 rounded bg-teal-600 text-white">Ubah</button>
          </div>
          <div className="bg-white rounded-lg border p-4 grid gap-2 text-sm">
              <Field label="Umur" value={lead.umur || '-'} />
              <Field label="Pekerjaan" value={lead.pekerjaan || '-'} />
              <Field label="Status Pernikahan" value={lead.statusPernikahan || '-'} />
              <Field label="Anggaran" value={lead.anggaran?.toLocaleString() || '-'} />
              <Field label="Tujuan Membeli" value={lead.tujuanMembeli || '-'} />
              <Field label="Cara Pembayaran" value={lead.caraPembayaran || '-'} />
              <Field label="Lokasi Klien" value={lead.lokasiKlien || '-'} />
              <Field label="Lokasi Diinginkan" value={lead.lokasiDiinginkan || '-'} />
              <Field label="Minat Klien" value={lead.minatKlien || '-'} multiline />
              <Field label="Catatan" value={lead.catatan || '-'} multiline />
          </div>
        </section>

        {/* Properti Diminati */}
        <section className="space-y-2">
          <h3 className="text-lg font-bold border-b pb-2 pt-2">Properti Diminati</h3>
          <div className="text-sm space-y-3">
            <div>
              <p className="text-slate-500">Nama Properti</p>
                <p className="font-semibold">{lead.property?.name || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">Harga Mulai</p>
                <p className="font-semibold">{formatIDR(lead.property?.price) || '-'}</p>
            </div>
          </div>
        </section>

        {/* Penugasan, Tag, Catatan */}
        <div>
          <div className="text-xs text-slate-500 mb-1">Penugasan</div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${conversation.assignedToMe ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{conversation.assignedToMe ? "Milik Saya" : "Belum Ditugaskan"}</span>
            <button onClick={onToggleAssign} className="text-xs px-2 py-1 border rounded-lg hover:bg-white">{conversation.assignedToMe ? "Lepaskan" : "Ambil"}</button>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Tag</div>
          <div className="flex flex-wrap gap-2">
            {(conversation.tags || []).length === 0 ? <span className="text-xs text-slate-400">-</span> : conversation.tags.map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{t}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Catatan</div>
          <textarea rows={3} placeholder="Tulis catatan internal..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {/* Modal edit info & profil */}
      {showInfoModal && (
        <LeadInfoEditModal
          lead={lead}
          onClose={() => setShowInfoModal(false)}
          onSaved={setLead}
        />
      )}
      {showProfileModal && (
        <LeadProfileEditModal
          lead={lead}
          onClose={() => setShowProfileModal(false)}
          onSaved={setLead}
        />
      )}

      <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
        <button className="px-3 py-2 text-sm border rounded-lg hover:bg-white">Tandai Selesai</button>
        <button className="px-3 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700">Simpan</button>
      </div>
    </div>
  );
}

function getInitials(name){
  return name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
}

function formatIDR(n){
  if(!n && n!==0) return '-';
  try{
    return new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits: 0 }).format(n);
  }catch{
    return `${n}`;
  }
}

function Field({ label, value, multiline }) {
  if (multiline) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase">{label}</span>
        <p className="whitespace-pre-wrap leading-relaxed">{value}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-500 uppercase">{label}</span>
      <span>{value}</span>
    </div>
  );
}
