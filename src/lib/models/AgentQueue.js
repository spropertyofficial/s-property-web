import mongoose from "mongoose";

const AgentQueueSchema = new mongoose.Schema({
  agents: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      order: { type: Number, required: true },
      active: { type: Boolean, default: true },
    }
  ],
  lastAssignedIndex: { type: Number, default: -1 }, // index terakhir yang dapat lead
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.AgentQueue || mongoose.model("AgentQueue", AgentQueueSchema);
