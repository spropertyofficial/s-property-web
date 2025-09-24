import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    }, // Lead yang terkait
    from: { type: String, required: true }, // Nomor pengirim (WhatsApp)
    to: { type: String, required: true }, // Nomor penerima (WhatsApp)
    body: { type: String }, // Isi pesan
    direction: { type: String, enum: ["inbound", "outbound"], required: true }, // Arah pesan
    status: {
      type: String,
      enum: ["received", "sent", "failed", "read"],
      default: "received",
    },
    sentAt: { type: Date, default: Date.now },
    receivedAt: { type: Date, default: Date.now },
  twilioSid: { type: String }, // SID dari Twilio (opsional)
  isTemplate: { type: Boolean, default: false }, // True jika pesan outbound adalah template message
    mediaUrls: [{ type: String }], // Array URL media
    mediaTypes: [{ type: String }], // Array tipe media
  },
  {
    timestamps: true,
    strict: false,
  }
);


/**
 * Static method untuk mengambil pesan inbound terakhir per lead.
 * Digunakan untuk identifikasi window 24 jam WhatsApp.
 * @param {ObjectId} leadId - ID lead yang ingin dicek
 * @returns {Promise<ChatMessage|null>} Pesan inbound terakhir atau null jika tidak ada
 */
ChatMessageSchema.statics.getLastInboundMessage = async function(leadId) {
  return await this.findOne({ lead: leadId, direction: "inbound" })
    .sort({ sentAt: -1 });
};

/**
 * Static method untuk mengambil pesan outbound terakhir per lead.
 * Digunakan untuk identifikasi window 24 jam WhatsApp (Twilio: window dibuka setelah outbound).
 * @param {ObjectId} leadId - ID lead yang ingin dicek
 * @returns {Promise<ChatMessage|null>} Pesan outbound terakhir atau null jika tidak ada
 */
ChatMessageSchema.statics.getLastOutboundMessage = async function(leadId) {
  return await this.findOne({ lead: leadId, direction: "outbound" })
    .sort({ sentAt: -1 });
};

/**
 * Static method untuk mengambil template message outbound terakhir per lead.
 * Digunakan untuk identifikasi window 24 jam WhatsApp (hanya template message yang membuka window).
 * @param {ObjectId} leadId - ID lead yang ingin dicek
 * @returns {Promise<ChatMessage|null>} Pesan template outbound terakhir atau null jika tidak ada
 */
ChatMessageSchema.statics.getLastTemplateMessage = async function(leadId) {
  return await this.findOne({ lead: leadId, direction: "outbound", isTemplate: true })
    .sort({ sentAt: -1 });
};

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
