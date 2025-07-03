import mongoose from "mongoose";
const ClusterSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
export default mongoose.models.Cluster ||
  mongoose.model("Cluster", ClusterSchema);
