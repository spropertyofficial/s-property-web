// src\lib\models\Admin.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: {
    type: String,
    enum: ["superadmin", "editor", "viewer"],
    default: "editor", // default role
  },
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
