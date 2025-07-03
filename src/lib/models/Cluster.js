import mongoose from "mongoose";

const ClusterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    gallery: [
      {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UnitType",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cluster ||
  mongoose.model("Cluster", ClusterSchema);
