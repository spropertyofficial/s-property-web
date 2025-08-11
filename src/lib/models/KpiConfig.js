import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema(
  {
    dailyScoreCap: { type: Number, default: 0 }, // 0 = no cap
    diminishingThreshold: { type: Number, default: 0 }, // after N activities per type
    diminishingFactor: { type: Number, default: 1 }, // multiplier after threshold (e.g., 0.5)
  },
  { _id: false }
);

const KpiConfigSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, unique: true }, // e.g., 'production'
    activityScores: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    rules: { type: RuleSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.KpiConfig ||
  mongoose.model("KpiConfig", KpiConfigSchema);
