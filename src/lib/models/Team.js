import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Merujuk ke user yang memiliki role 'leader'
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Array berisi semua ID user yang menjadi anggota
      },
    ],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Setiap tim terkait dengan satu proyek
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
