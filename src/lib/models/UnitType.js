import mongoose from "mongoose";
const UnitTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
export default mongoose.models.UnitType ||
  mongoose.model("UnitType", UnitTypeSchema);
