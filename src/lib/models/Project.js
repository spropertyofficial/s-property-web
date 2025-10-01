import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Nama proyek
  whatsappNumber: { type: String, required: true }, // Nomor WhatsApp khusus proyek
  agentQueue: { type: mongoose.Schema.Types.ObjectId, ref: "AgentQueue" }, // Relasi ke agent queue/sales team
  description: { type: String }, // Opsional, deskripsi proyek
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);