import mongoose from "mongoose";

const AgentActivitySchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "property_created",
        "property_updated", 
        "property_viewed",
        "client_contacted",
        "client_meeting",
        "property_shown",
        "inquiry_received",
        "inquiry_responded",
        "deal_negotiated",
        "deal_closed",
        "login",
        "profile_updated"
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedProperty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    value: {
      type: Number, // For activities with monetary value like deals
      default: 0,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
AgentActivitySchema.index({ agent: 1, createdAt: -1 });
AgentActivitySchema.index({ activityType: 1, createdAt: -1 });
AgentActivitySchema.index({ createdAt: -1 });

export default mongoose.models.AgentActivity || mongoose.model("AgentActivity", AgentActivitySchema);