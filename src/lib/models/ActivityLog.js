import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActivityType",
    },
    activityType: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, "Jenis aktivitas terlalu panjang"],
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Catatan maksimal 1000 karakter"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    rejectReason: {
      type: String,
      trim: true,
      maxlength: [500, "Alasan penolakan maksimal 500 karakter"],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    attachments: [
      new mongoose.Schema(
        {
          url: { type: String, required: true, trim: true },
          publicId: { type: String, trim: true },
          size: { type: Number },
          mimeType: { type: String, trim: true },
          width: { type: Number },
          height: { type: Number },
        },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
