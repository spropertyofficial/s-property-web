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
    parentRegion: { 
      type: String, 
      required: function() { return this.type === "city"; },
      index: true
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
    priority: { 
      type: Number, 
      default: 0 
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
      { parentRegion: 1, type: 1 },
      { slug: 1 }
    ]
  }
);

// Index untuk query yang sering digunakan
RegionCityImageSchema.index({ type: 1, isActive: 1, priority: -1 });
RegionCityImageSchema.index({ parentRegion: 1, type: 1, isActive: 1 });

export default mongoose.models.RegionCityImage ||
  mongoose.model("RegionCityImage", RegionCityImageSchema);
