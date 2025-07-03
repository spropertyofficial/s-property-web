import mongoose from "mongoose";
const UnitTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cluster: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster' },
});
export default mongoose.models.UnitType ||
  mongoose.model("UnitType", UnitTypeSchema);
