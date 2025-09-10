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
    body: { type: String, required: true }, // Isi pesan
    direction: { type: String, enum: ["inbound", "outbound"], required: true }, // Arah pesan
    status: {
      type: String,
      enum: ["received", "sent", "failed", "read"],
      default: "received",
    },
    sentAt: { type: Date, default: Date.now },
    receivedAt: { type: Date, default: Date.now },
    twilioSid: { type: String }, // SID dari Twilio (opsional)
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", ChatMessageSchema);
