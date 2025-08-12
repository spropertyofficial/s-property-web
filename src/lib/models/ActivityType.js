import mongoose from "mongoose";

const ActivityTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    score: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityType ||
  mongoose.model("ActivityType", ActivityTypeSchema);
