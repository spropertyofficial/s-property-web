import mongoose from "mongoose";

const CategoryListingStatusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Dijual", "Disewakan", "Terjual Habis", "Segera Hadir"
});

export default mongoose.models.CategoryListingStatus ||
  mongoose.model("CategoryListingStatus", CategoryListingStatusSchema);
