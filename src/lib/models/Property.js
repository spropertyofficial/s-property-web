import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    startPrice: { type: Number, required: true },
    developer: { type: String },
    location: {
      region: String,
      city: String,
      area: String,
      address: String,
      mapsLink: String,
    },
    gallery: [
      {
        src: { type: String, required: true },
        alt: { type: String, required: true },
        type: { type: String, default: "property" },
        publicId: { type: String, required: true },
      },
    ],
    // --- Kategori Dinamis (Referensi ke model lain) ---
    assetType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryAssetType",
      required: true,
    },
    marketStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryMarketStatus",
      required: true,
    },
    listingStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryListingStatus",
      required: true,
    },

    // --- Relasi ke Cluster (Untuk masa depan) ---
    clusters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cluster" }],

    // --- Jejak Audit ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
