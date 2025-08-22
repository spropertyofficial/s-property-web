import mongoose from "mongoose";

// Sub-schema for uploaded documents related to lead's transaction progression
const LeadAttachmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 }, // e.g., KTP, NPWP, Bukti Booking
  url: { type: String, required: true, trim: true },
  publicId: { type: String, trim: true }, // for cloud storage deletion
  size: { type: Number }, // bytes
  mimeType: { type: String, trim: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const KerabatSchema = new mongoose.Schema(
  {
    nama: { type: String, trim: true, maxlength: 100 },
    kontak: { type: String, trim: true, maxlength: 50 },
  },
  { _id: false }
);

const LeadSchema = new mongoose.Schema(
  {
    // Informasi Awal (required minimal saat create)
    name: { type: String, required: true, trim: true, maxlength: 150 }, // Nama Prospek
    contact: { type: String, trim: true, maxlength: 50 }, // Nomor Telepon / WA
    email: { type: String, trim: true, lowercase: true, maxlength: 150 },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" }, // Properti diminati
    propertyName: { type: String, trim: true, maxlength: 150 }, // Fallback nama properti ketika property ref belum tersedia
    unit: { type: String, trim: true, maxlength: 100 }, // Unit / Block / No.
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Agen / Mitra penanggung jawab
    source: { type: String, trim: true, maxlength: 100 }, // Sumber mengetahui proyek
    status: {
      type: String,
      enum: [
        "Baru",
        "Hot",
        "Warm",
        "Cold",
        "Reservasi",
        "Booking",
        "Closing",
        "No Respond",
      ],
      default: "Baru",
      required: true,
    },

    // Informasi Lanjutan (optional awalnya, diisi setelah follow up)
    umur: { type: Number, min: 0, max: 120 },
    pekerjaan: { type: String, trim: true, maxlength: 150 },
    statusPernikahan: { type: String, trim: true, maxlength: 50 },
    anggaran: { type: Number, min: 0 },
    tujuanMembeli: { type: String, trim: true, maxlength: 300 },
    caraPembayaran: { type: String, trim: true, maxlength: 100 },
    lokasiKlien: { type: String, trim: true, maxlength: 150 },
    lokasiDiinginkan: { type: String, trim: true, maxlength: 150 },
    minatKlien: { type: String, trim: true, maxlength: 500 }, // Request khusus
    kerabat: KerabatSchema, // Kerabat tidak serumah
    catatan: { type: String, trim: true, maxlength: 2000 },

    attachments: [LeadAttachmentSchema], // Dokumen bertahap (KTP, NPWP, bukti transfer, dll.)
  },
  { timestamps: true }
);

// Indexes for common queries
LeadSchema.index({ status: 1, agent: 1, createdAt: -1 });
LeadSchema.index({ name: 1 });
// Removed plain contact index to avoid duplication with partial unique contact index below
// Prevent duplicate active leads (allow reuse after Closing). Partial unique indexes.
try {
  LeadSchema.index(
    { contact: 1 },
    {
      unique: true,
      partialFilterExpression: {
        contact: { $type: "string" },
        status: { $ne: "Closing" },
      },
    }
  );
  LeadSchema.index(
    { email: 1 },
    {
      unique: true,
      sparse: true,
      partialFilterExpression: {
        email: { $type: "string" },
        status: { $ne: "Closing" },
      },
    }
  );
} catch (_) {
  // ignore index build races in dev
}

// Future idea: partial index for active funnel (exclude Closing) if needed.

// Hook for normalization & placeholder conditional validations
LeadSchema.pre("validate", function (next) {
  // Normalize contact: remove spaces & dashes
  if (this.contact) {
    this.contact = this.contact.replace(/[-\s]/g, "");
  }
  // Basic email pattern (allow empty). We rely on application layer for stronger validation.
  if (this.email && !/^\S+@\S+\.\S+$/.test(this.email)) {
    this.invalidate("email", "Format email tidak valid");
  }
  // Future conditional rules example:
  // if (["Reservasi", "Booking", "Closing"].includes(this.status)) {
  //   if (!this.attachments || this.attachments.length === 0) {
  //     this.invalidate("attachments", "Minimal 1 dokumen diperlukan pada status ini");
  //   }
  // }
  // TODO (future): on transition to Closing, create SaleRecord automatically
  next();
});

// Recompile safeguard for schema/enums changes during dev / serverless cold start
if (mongoose.models.Lead) {
  try {
    mongoose.deleteModel("Lead");
  } catch (_) {
    delete mongoose.models.Lead;
  }
}

export default mongoose.model("Lead", LeadSchema);
