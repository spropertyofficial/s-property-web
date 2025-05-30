import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["agent", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    agentCode: {
      type: String,
      unique: true,
      sparse: true, // Only required for agents
    },
  },
  {
    timestamps: true,
  }
);

// Generate agent code before saving
UserSchema.pre("save", function (next) {
  if (this.type === "agent" && !this.agentCode) {
    this.agentCode = "AGT" + Date.now().toString().slice(-6);
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
