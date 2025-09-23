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
    mediaUrls: [{ type: String }], // Array URL media
    mediaTypes: [{ type: String }], // Array tipe media
  },
  {
    timestamps: true,
    strict: false,
  }
);

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
