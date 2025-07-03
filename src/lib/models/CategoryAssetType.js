import mongoose from "mongoose";

const CategoryAssetTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Rumah", "Apartemen", "Ruko", "Tanah", "Kavling"
});

export default mongoose.models.CategoryAssetType ||
  mongoose.model("CategoryAssetType", CategoryAssetTypeSchema);
