"use client";
import { useEffect, useState, use } from "react";
import LeadStatusBadge from "../components/LeadStatusBadge";
import AttachmentManager from "../components/AttachmentManager";
import LeadInfoEditModal from "../components/LeadInfoEditModal";
import Link from "next/link";
import LeadProfileEditModal from "../components/LeadProfileEditModal";

export default function LeadDetailPage({ params }) {
  // Next.js: params is now a Promise; unwrap with React.use()
  const { id } = use(params);
  const [lead, setLead] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("Lead", lead);
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memuat lead");
      setLead(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/leads" className="text-sm text-tosca-200">
          ← Kembali
        </Link>
        <h1 className="font-semibold text-lg flex-1 truncate">Detail Lead</h1>
        {lead && <LeadStatusBadge status={lead.status} />}
      </div>
      {loading && <SkeletonDetail />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {lead && !loading && !error && (
        <div className="space-y-6">
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
              <DisplayField label="Nama" value={lead.name} />
              <DisplayField label="Kontak" value={lead.contact} />
              <DisplayField label="Email" value={lead.email} />
              <DisplayField
                label="Status"
                value={<LeadStatusBadge status={lead.status} />}
                raw
              />
              <DisplayField
                label="Properti"
                value={lead.property?.name || lead.propertyName}
              />
              <DisplayField label="Unit" value={lead.unit} />
              <DisplayField label="Sumber" value={lead.source} />
              <DisplayField
                label="Diperbarui"
                value={new Date(lead.updatedAt).toLocaleString()}
              />
            </div>
          </section>
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
              <DisplayField label="Umur" value={lead.umur} />
              <DisplayField label="Pekerjaan" value={lead.pekerjaan} />
              <DisplayField
                label="Status Pernikahan"
                value={lead.statusPernikahan}
              />
              <DisplayField
                label="Anggaran"
                value={lead.anggaran?.toLocaleString()}
              />
              <DisplayField label="Tujuan Membeli" value={lead.tujuanMembeli} />
              <DisplayField
                label="Cara Pembayaran"
                value={lead.caraPembayaran}
              />
              <DisplayField label="Lokasi Klien" value={lead.lokasiKlien} />
              <DisplayField
                label="Lokasi Diinginkan"
                value={lead.lokasiDiinginkan}
              />
              <DisplayField
                label="Minat Klien"
                value={lead.minatKlien}
                multiline
              />
              <DisplayField label="Catatan" value={lead.catatan} multiline />
            </div>
          </section>
          <section className="space-y-2">
            <AttachmentManager
              leadId={lead._id}
              attachments={lead.attachments || []}
              onChange={(atts) => setLead((l) => ({ ...l, attachments: atts }))}
            />
          </section>
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
      )}
    </div>
  );
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

function SkeletonDetail() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="bg-white rounded-lg border p-4 grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="bg-white rounded-lg border p-4 grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 rounded w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 bg-slate-200 rounded" />
        <div className="bg-white rounded-lg border p-6" />
      </div>
    </div>
  );
}

function DisplayField({ label, value, multiline, raw }) {
  const content =
    value == null || value === "" ? (
      <span className="text-slate-400">-</span>
    ) : (
      value
    );
  if (multiline) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium text-slate-500 uppercase">
          {label}
        </span>
        <p className="whitespace-pre-wrap leading-relaxed text-sm">{content}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium text-slate-500 uppercase">
        {label}
      </span>
      <span className="text-sm">{raw ? content : content}</span>
    </div>
  );
}
