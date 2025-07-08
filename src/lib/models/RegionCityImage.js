import mongoose from "mongoose";

const RegionCityImageSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      unique: true 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ["region", "city"] 
    },
    slug: { 
      type: String, 
      required: true,
      unique: true 
    },
    image: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { 
    timestamps: true,
    indexes: [
      { type: 1, isActive: 1 },
      { slug: 1 },
      { name: 1, type: 1 }
    ]
  }
);

// Index untuk query yang sering digunakan
RegionCityImageSchema.index({ type: 1, isActive: 1 });

export default mongoose.models.RegionCityImage ||
  mongoose.model("RegionCityImage", RegionCityImageSchema);
