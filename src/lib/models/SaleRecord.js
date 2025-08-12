import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    size: { type: Number },
    mimeType: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const SaleRecordSchema = new mongoose.Schema(
  {
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    // Fallback bila projectId belum tersedia di master
    projectName: { type: String, trim: true },

    // Detail unit dipisah agar konsisten
    block: { type: String, trim: true },
    unitType: { type: String, trim: true },

    // Tanggal closing wajib bila status Closing
    tanggalClosing: { type: Date },

    // KPI memakai ini sebagai pendapatan
    hargaPropertiTerjual: {
      type: Number,
      min: [0, "Nilai harus >= 0"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Closing", "Cancelled"],
      default: "Closing",
      required: true,
    },

    // Kategori aset (Rumah, Ruko, Tanah, dst) dari master CategoryAssetType
    assetTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "CategoryAssetType" },

    notes: { type: String, trim: true, maxlength: 1000 },
    attachments: [AttachmentSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// Validasi custom untuk fallback projectName
SaleRecordSchema.pre("validate", function (next) {
  if (!this.projectId && !this.projectName) {
    this.invalidate("projectName", "projectName wajib diisi jika projectId kosong");
  }
  if (this.status === "Closing" && !this.tanggalClosing) {
    this.invalidate("tanggalClosing", "tanggalClosing wajib untuk status Closing");
  }
  next();
});

// Index untuk performa query
SaleRecordSchema.index({ status: 1, tanggalClosing: -1, agentId: 1, projectId: 1 });

// Penting untuk pengembangan (Next.js HMR): ketika skema berubah (enum dari Closed->Closing),
// model yang sudah ter-compile bisa tetap memakai skema lama. Hapus model lama lalu re-compile.
if (mongoose.models.SaleRecord) {
  try {
    mongoose.deleteModel("SaleRecord");
  } catch (_) {
    // abaikan jika belum tersedia (kompatibilitas versi)
    delete mongoose.models.SaleRecord;
  }
}

export default mongoose.model("SaleRecord", SaleRecordSchema);
