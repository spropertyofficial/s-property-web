import mongoose from "mongoose";

const ResidentialSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    startPrice: { type: Number, required: true },
    developer: { type: String, required: true },
    clusters: [{ type: String }],
    propertyStatus: {
      type: String,
      enum: ["SALE", "RENT", "SOLD", "COMING_SOON"],
      default: "SALE",
    },
    location: {
      region: String,
      city: String,
      area: String,
      address: String,
      country: String,
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
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Residential ||
  mongoose.model("Residential", ResidentialSchema);
