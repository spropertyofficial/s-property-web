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
      enum: ["agent", "user", "semi-agent", "sales-inhouse", "karyawan"],
      default: "user",
    },
    // For sales-inhouse: list of allowed Property IDs they can sell
    allowedProperties: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    agentCode: {
      type: String,
      unique: true,
      sparse: true, // Only required for agents
    },

    // Force user to change password on first login (for auto-created users)
    forcePasswordChange: {
      type: Boolean,
      default: false,
    },

    // Untuk fitur lupa password
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Web Push: Multiple device subscriptions per user
    pushSubscriptions: [
      new mongoose.Schema(
        {
          endpoint: { type: String, required: true },
          expirationTime: { type: Number, default: null },
          keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
          },
          addedAt: { type: Date, default: Date.now },
        },
        { _id: false }
      ),
    ],
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

// Index on subscription endpoint for faster lookups/removals
UserSchema.index({ "pushSubscriptions.endpoint": 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
