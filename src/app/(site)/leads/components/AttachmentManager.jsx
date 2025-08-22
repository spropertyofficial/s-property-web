"use client";
import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { Trash2, Paperclip, Plus, Upload, Eye, Download } from "lucide-react";

export default function AttachmentManager({ leadId, attachments, onChange }) {
  const [openForm, setOpenForm] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null); // attachment object
  console.log("Attachments", attachments);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setPreview(null);
    }
    if (preview) window.addEventListener("keydown", onKey);
    else window.removeEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const openPreview = useCallback((att) => {
    setPreview(att);
  }, []);
  const closePreview = useCallback(() => setPreview(null), []);

  async function addAttachment(e) {
    e.preventDefault();
    if (!title.trim()) return;
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);
      const res = await fetch(`/api/leads/${leadId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success)
        throw new Error(json.error || "Gagal menambah lampiran");
      onChange?.(json.data);
      window.dispatchEvent(
        new CustomEvent("lead:attachments", {
          detail: { id: leadId, attachments: json.data },
        })
      );
      setTitle("");
      setFile(null);
      setOpenForm(false);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Lampiran ditambahkan', timer:1500, showConfirmButton:false });
    } catch (e) {
      setError(e.message);
      Swal.fire({ icon:'error', title:'Gagal', text: e.message || 'Upload gagal' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteAttachment(attId) {
    const confirmRes = await Swal.fire({
      title: 'Hapus lampiran?',
      text: 'Tindakan ini tidak bisa dibatalkan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626'
    });
    if (!confirmRes.isConfirmed) return;
    try {
      const res = await fetch(`/api/leads/${leadId}/attachments/${attId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menghapus");
      onChange?.(json.data);
      window.dispatchEvent(
        new CustomEvent("lead:attachments", {
          detail: { id: leadId, attachments: json.data },
        })
      );
      Swal.fire({ icon:'success', title:'Terhapus', text:'Lampiran dihapus', timer:1200, showConfirmButton:false });
    } catch (e) {
      Swal.fire({ icon:'error', title:'Gagal', text: e.message || 'Tidak bisa menghapus' });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-1">
          <Paperclip size={14} /> Lampiran
        </h3>
        <div className="flex items-center gap-2">
          <a
            href={`/api/leads/${leadId}/attachments/download`}
            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white flex items-center gap-1"
            title="Unduh semua lampiran (ZIP)"
          >
            <Download size={12}/> Folder
          </a>
          <button
            onClick={() => setOpenForm((o) => !o)}
            className="text-xs px-2 py-1 rounded bg-teal-600 text-white flex items-center gap-1"
          >
            <Plus size={12} /> {openForm ? "Tutup" : "Tambah"}
          </button>
        </div>
      </div>
      {openForm && (
        <form
          onSubmit={addAttachment}
          className="bg-slate-50 rounded border p-3 flex flex-col gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <Upload size={14} /> <span>Upload File</span>
          </div>
          <div className="flex flex-col gap-2">
            <input
              placeholder="Judul dokumen"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
          </div>
          {error && <p className="text-[11px] text-red-600">{error}</p>}
          <div className="flex gap-2 text-xs">
            <button
              disabled={loading}
              type="submit"
              className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
            >
              {loading ? "Mengupload..." : "Simpan"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOpenForm(false);
                setError(null);
              }}
              className="px-3 py-1 rounded bg-slate-200"
            >
              Batal
            </button>
          </div>
        </form>
      )}
      <ul className="divide-y border rounded">
        {attachments?.length === 0 && (
          <li className="p-3 text-xs text-slate-500">Belum ada lampiran.</li>
        )}
  {attachments?.map((att, idx) => (
          <li
            key={att._id || att.url}
            className="p-3 text-sm flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{att.title}</p>
              <span className="text-[11px] text-slate-500">
                {humanType(att.mimeType)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openPreview(att)}
                className="p-1 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                title="Preview"
              >
                <Eye size={14} />
              </button>
              <a
                href={att.url}
                target="_blank"
                rel="noopener"
                className="p-1 rounded hover:bg-slate-50 text-slate-500 hover:text-slate-700"
                title="Buka di tab baru"
              >
                <Upload size={14} />
              </a>
              <a
                href={att.url}
                download
                className="p-1 rounded hover:bg-green-50 text-slate-500 hover:text-green-600"
                title="Unduh"
              >
                <Download size={14} />
              </a>
              <button
                onClick={() => deleteAttachment(att._id || idx)}
                className="p-1 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                title="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {preview && <PreviewModal attachment={preview} onClose={closePreview} />}
    </div>
  );
}

function humanType(mime) {
  if (!mime) return "File";
  if (mime.startsWith("image/")) return "Gambar";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("sheet") || mime.includes("excel")) return "Spreadsheet";
  if (mime.includes("word")) return "Dokumen Word";
  if (mime.includes("zip")) return "Arsip";
  return mime.split("/")[1] || "File";
}

function PreviewModal({ attachment, onClose }) {
  const { title, url, mimeType } = attachment || {};
  const isImage = mimeType?.startsWith("image/");
  const isPDF = mimeType === "application/pdf";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="font-medium text-sm truncate pr-4">{title}</h4>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              className="px-2 py-1 rounded bg-green-600 text-white text-xs flex items-center gap-1"
            >
              <Download size={12} /> Unduh
            </a>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm px-2 py-1"
            >
              Tutup
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex-1 bg-slate-50">
          {isImage && (
            <img
              src={url}
              alt={title}
              className="max-w-full h-auto rounded shadow"
            />
          )}
          {isPDF && (
            <iframe
              src={`${url}#view=FitH`}
              title={title}
              className="w-full h-[70vh] rounded border"
            />
          )}
          {!isImage && !isPDF && (
            <div className="text-center text-sm text-slate-600 space-y-3">
              <p>Preview tidak tersedia untuk tipe ini.</p>
              <a
                href={url}
                target="_blank"
                rel="noopener"
                className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                Buka / Unduh
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
