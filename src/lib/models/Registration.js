import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    // Data Pribadi (Step 1)
    personalData: {
      fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
      },
      category: {
        type: String,
        required: true,
        enum: ["semi-agent", "agent", "sales-inhouse"],
      },
      birthPlace: {
        type: String,
        required: true,
        trim: true,
      },
      birthDate: {
        type: Date,
        required: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        match: /^\+62[8][0-9]{8,11}$/,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^\S+@\S+\.\S+$/,
      },
      referralPhone: {
        type: String,
        trim: true,
        match: /^\+62[8][0-9]{8,11}$/,
        default: null,
      },
    },

    // Data Dokumen (Step 2)
    documents: {
      city: {
        type: String,
        required: true,
        trim: true,
      },
      nik: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{16}$/,
        unique: true,
      },
      npwp: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{15,16}$/,
      },
      ktpFile: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
      npwpFile: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    },

    // Data Rekening (Step 3)
    bankAccount: {
      accountNumber: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{10,15}$/,
      },
      bankName: {
        type: String,
        required: true,
        trim: true,
      },
      accountHolder: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
      },
      bankBookFile: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    },

    // Status dan Metadata
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    
    reviewNotes: {
      type: String,
      trim: true,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    userAgent: {
      type: String,
      trim: true,
    },

    // Link to created user account (if approved)
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Store plaintext password for admin display (only after approval)
    generatedPassword: {
      type: String,
      default: null,
      select: false, // Hide by default, must be selected explicitly
    },
  },
  {
    timestamps: true,
    collection: "registrations",
  }
);

// Indexes for better performance
RegistrationSchema.index({ "personalData.email": 1 });
RegistrationSchema.index({ "personalData.phone": 1 });
// RegistrationSchema.index({ "documents.nik": 1 }); // Dihapus, sudah ada unique di schema
RegistrationSchema.index({ status: 1 });
RegistrationSchema.index({ submittedAt: -1 });

// Virtual for full registration data
RegistrationSchema.virtual("fullData").get(function () {
  return {
    id: this._id,
    personalData: this.personalData,
    documents: this.documents,
    bankAccount: this.bankAccount,
    status: this.status,
    submittedAt: this.submittedAt,
    reviewNotes: this.reviewNotes,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
  };
});

// Method to update status
RegistrationSchema.methods.updateStatus = function (status, reviewNotes, reviewedBy) {
  this.status = status;
  this.reviewNotes = reviewNotes;
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  return this.save();
};

// Static method to get registration statistics
RegistrationSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0,
  };

  stats.forEach((stat) => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Static method for export data
RegistrationSchema.statics.getForExport = async function (filters = {}) {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.startDate && filters.endDate) {
    query.submittedAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  return this.find(query)
    .sort({ submittedAt: -1 })
    .lean();
};

const Registration = mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);

export default Registration;
