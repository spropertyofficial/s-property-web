import mongoose from "mongoose";

const CategoryMarketStatusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "Primary", "Secondary"
});

export default mongoose.models.CategoryMarketStatus ||
  mongoose.model("CategoryMarketStatus", CategoryMarketStatusSchema);
