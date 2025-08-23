"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LeadStatusBadge from "@/app/(site)/leads/components/LeadStatusBadge";
import AttachmentManager from "@/app/(site)/leads/components/AttachmentManager";

export default function AdminLeadDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leads/${id}`);
        const j = await res.json();
        if (!j.success) throw new Error(j.error || "Gagal memuat");
        setData(j.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">Detail Lead</h1>
        <Link href="/admin/leads" className="text-sm text-tosca-600">
          Kembali
        </Link>
      </div>
      {loading && <p className="text-sm text-slate-500">Memuat…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Kolom kiri: Informasi lengkap */}
          <div className="bg-white border rounded p-4 lg:col-span-2">
            <h2 className="font-medium mb-3">Informasi Utama</h2>
            {/* Ringkasan di atas */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
              <div>
                <span className="text-slate-500">Tanggal:</span> {new Date(data.createdAt).toLocaleDateString()}
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <LeadStatusBadge status={data.status} />
              </div>
              <div className="hidden sm:block text-slate-300">•</div>
              <div>
                <span className="text-slate-500">Diperbarui:</span> {new Date(data.updatedAt).toLocaleDateString()}
              </div>
            </div>

            {/* Detail utama termasuk properti */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Nama" value={data.name} />
              <Field label="Kontak" value={data.contact} />
              <Field label="Email" value={data.email} />
              <Field label="Sumber" value={data.source} />
              <Field label="Milik" value={data.agent?.name} />
              <Field label="Proyek" value={data.property?.name || data.propertyName} />
              <Field label="Unit" value={data.unit} />
            </div>
            <hr className="my-3" />
            <h3 className="font-medium mb-2">Profil & Preferensi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Umur" value={isNum(data.umur) ? String(data.umur) : undefined} />
              <Field label="Pekerjaan" value={data.pekerjaan} />
              <Field label="Status Pernikahan" value={data.statusPernikahan} />
              <Field label="Anggaran" value={isNum(data.anggaran) ? formatCurrency(data.anggaran) : undefined} />
              <Field label="Tujuan Membeli" value={data.tujuanMembeli} />
              <Field label="Cara Pembayaran" value={data.caraPembayaran} />
              <Field label="Lokasi Klien" value={data.lokasiKlien} />
              <Field label="Lokasi Diinginkan" value={data.lokasiDiinginkan} />
              <Field label="Minat Khusus" value={data.minatKlien} />
              <Field label="Kerabat (Nama)" value={data.kerabat?.nama} />
              <Field label="Kerabat (Kontak)" value={data.kerabat?.kontak} />
            </div>
            <div className="mt-3">
              <Field label="Catatan" value={data.catatan} multiline />
            </div>
          </div>

          {/* Kolom kanan: Lampiran (tidak full width) */}
          <div className="bg-white border rounded p-4">
            <AttachmentManager
              leadId={data._id}
              attachments={data.attachments || []}
              onChange={(atts) => setData((prev) => ({ ...prev, attachments: atts }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, multiline = false }) {
  const display = value == null || value === "" ? "-" : value;
  if (multiline) {
    return (
      <div className="sm:col-span-2">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm whitespace-pre-wrap break-words bg-slate-50 border rounded p-2">{display}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm">{display}</p>
    </div>
  );
}

function isNum(v) { return typeof v === "number" && !Number.isNaN(v); }
function formatCurrency(n) {
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  } catch { return String(n); }
}
