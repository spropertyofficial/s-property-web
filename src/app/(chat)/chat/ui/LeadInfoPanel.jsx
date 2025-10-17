"use client";
import { useState, useEffect } from "react";
import LeadInfoEditModal from "@/app/(site)/leads/components/LeadInfoEditModal";
import LeadProfileEditModal from "@/app/(site)/leads/components/LeadProfileEditModal";
import LeadAssignmentPanel from "./components/LeadAssignmentPanel";

export default function LeadInfoPanel({ leadDetail, isLoading }) {
  // State for modal edit
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lead, setLead] = useState(leadDetail || null); // Ensure lead is not null
  useEffect(() => {
    setLead(leadDetail || null);
  }, [leadDetail]);
  console.log("LeadInfoPanel:", lead);

  if (!leadDetail) {
    return (
      <div className="h-full grid place-items-center text-slate-400 p-4 text-center">
        <div>
          <div className="text-4xl mb-4">👤</div>
          <div className="font-bold">Informasi Lead</div>
        </div>
      </div>
    );
  }

  if (!leadDetail || isLoading  ) {
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
          {getInitials(lead?.name ?? "")}
        </div>
        <div>
          <p className="font-bold text-lg">{lead?.name ?? "-"}</p>
          <p className="text-sm text-slate-500">{lead?.contact ?? "-"}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        {/* Info Lead */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Informasi Lead
            </h2>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-xs px-3 py-1 rounded bg-teal-600 text-white"
            >
              Ubah
            </button>
          </div>
          <div className="bg-white rounded-lg border p-4 grid gap-2 text-sm">
            <Field label="Nama" value={lead?.name ?? "-"} />
            <Field label="Kontak" value={lead?.contact ?? "-"} />
            <Field label="Email" value={lead?.email ?? "-"} />
            <Field label="Status" value={lead?.status ?? "-"} />
            <Field label="Sudah Diklaim" value={lead?.isClaimed ? "Ya" : "Belum"} />
            <Field label="Agent" value={lead?.agent ? `${lead.agent.name ?? "-"}${lead.agent.agentCode ? ` (${lead.agent.agentCode})` : ""}` : "-"} />
            <Field label="Sumber" value={lead?.source ?? "-"} />
            <Field label="Proyek" value={lead?.property?.name ?? lead?.propertyName ?? "-"} />
            <Field label="Unit" value={lead?.unit ?? "-"} />
            <Field label="Tanggal Lead Masuk" value={lead?.leadInAt ? new Date(lead.leadInAt).toLocaleDateString() : lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"} />
            <Field label="Tanggal Ditambahkan" value={lead?.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"} />
            <Field label="Diperbarui" value={lead?.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "-"} />
            {/* Kerabat */}
            {lead?.kerabat && (
              <div className="mt-2">
                <span className="text-[11px] font-medium text-slate-500 uppercase">Kerabat Tidak Serumah</span>
                <div className="ml-2">
                  <Field label="Nama Kerabat" value={lead.kerabat.nama ?? "-"} />
                  <Field label="Kontak Kerabat" value={lead.kerabat.kontak ?? "-"} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Profil Lead */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Profil Lead
            </h2>
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-xs px-3 py-1 rounded bg-teal-600 text-white"
            >
              Ubah
            </button>
          </div>
          <div className="bg-white rounded-lg border p-4 grid gap-2 text-sm">
            <Field label="Umur" value={lead?.umur ?? "-"} />
            <Field label="Pekerjaan" value={lead?.pekerjaan ?? "-"} />
            <Field label="Status Pernikahan" value={lead?.statusPernikahan ?? "-"} />
            <Field label="Anggaran" value={lead?.anggaran ? formatIDR(lead.anggaran) : "-"} />
            <Field label="Tujuan Membeli" value={lead?.tujuanMembeli ?? "-"} />
            <Field label="Cara Pembayaran" value={lead?.caraPembayaran ?? "-"} />
            <Field label="Lokasi Klien" value={lead?.lokasiKlien ?? "-"} />
            <Field label="Lokasi Diinginkan" value={lead?.lokasiDiinginkan ?? "-"} />
            <Field label="Minat Klien" value={lead?.minatKlien ?? "-"} multiline />
            <Field label="Catatan" value={lead?.catatan ?? "-"} multiline />
          </div>
        </section>

        <div>
          <div className="text-xs text-slate-500 mb-1">Catatan</div>
          <textarea
            rows={3}
            placeholder="Tulis catatan internal..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
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
    </div>
  );
}

function getInitials(name) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatIDR(n) {
  if (!n && n !== 0) return "-";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}`;
  }
}

function Field({ label, value, multiline }) {
  if (multiline) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-slate-500 uppercase">
          {label}
        </span>
        <p className="whitespace-pre-wrap leading-relaxed">{value}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium text-slate-500 uppercase">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
