"use client";
import { useEffect, useState, use } from "react";
import LeadStatusBadge from "../components/LeadStatusBadge";
import AttachmentManager from "../components/AttachmentManager";
import LeadInfoEditModal from "../components/LeadInfoEditModal";
import Link from "next/link";
import LeadProfileEditModal from "../components/LeadProfileEditModal";

// Add: helpers to normalize phone number and build WhatsApp link
function normalizePhoneTo62(phone) {
  if (!phone) return "";
  const digits = ("" + phone)
    .replace(/[^0-9+]/g, "") // keep digits and +
    .replace(/^\+/, ""); // drop leading + to unify handling
  if (!digits) return "";
  // Cases:
  // 1) starts with 0 -> replace with 62
  // 2) starts with 62 -> keep
  // 3) starts with 8.. (common user input) -> prepend 62
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return digits; // fallback
}
function buildWaLink(phone, name) {
  const num = normalizePhoneTo62(phone);
  if (!num) return null;
  const text = `Halo ${name || ""}, saya dari S-Property. Boleh dibantu untuk tindak lanjut?`;
  const encoded = encodeURIComponent(text.trim());
  return `https://wa.me/${num}?text=${encoded}`;
}

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
              <DisplayField
                label="Kontak"
                raw
                value={
                  <div className="flex items-center gap-2">
                    <span>
                      {lead.contact || (
                        <span className="text-slate-400">-</span>
                      )}
                    </span>
                    {lead?.contact && (
                      <a
                        href={buildWaLink(lead.contact, lead.name) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                        aria-label="Hubungi via WhatsApp"
                        onClick={(e) => {
                          if (!buildWaLink(lead.contact, lead.name))
                            e.preventDefault();
                        }}
                      >
                        {/* Simple WA icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .02 5.35.02 11.97c0 2.11.55 4.17 1.6 5.99L0 24l6.2-1.62a11.93 11.93 0 005.79 1.49h.01c6.62 0 11.97-5.35 11.97-11.97 0-3.2-1.25-6.21-3.45-8.41zM12 21.54h-.01a9.55 9.55 0 01-4.86-1.32l-.35-.2-3.68.96.98-3.59-.23-.37A9.55 9.55 0 012.45 12C2.45 6.74 6.74 2.45 12 2.45c2.56 0 4.96 1 6.77 2.81a9.54 9.54 0 012.81 6.77c0 5.26-4.29 9.51-9.58 9.51zm5.52-7.11c-.3-.15-1.77-.88-2.04-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.48-1.74-1.66-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.64.71.23 1.36.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.31.17-1.42-.07-.1-.27-.17-.57-.32z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                }
              />
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
