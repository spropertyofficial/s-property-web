import mongoose from "mongoose";

const AgentKPISchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    
    // Activity Metrics
    totalActivities: {
      type: Number,
      default: 0,
    },
    propertiesCreated: {
      type: Number,
      default: 0,
    },
    propertiesUpdated: {
      type: Number,
      default: 0,
    },
    clientsContacted: {
      type: Number,
      default: 0,
    },
    inquiriesReceived: {
      type: Number,
      default: 0,
    },
    inquiriesResponded: {
      type: Number,
      default: 0,
    },
    propertiesShown: {
      type: Number,
      default: 0,
    },
    dealsNegotiated: {
      type: Number,
      default: 0,
    },
    dealsClosed: {
      type: Number,
      default: 0,
    },
    
    // Calculated Performance Metrics
    responseRate: {
      type: Number, // inquiriesResponded / inquiriesReceived * 100
      default: 0,
    },
    conversionRate: {
      type: Number, // dealsClosed / inquiriesReceived * 100
      default: 0,
    },
    activityScore: {
      type: Number, // Weighted score based on activity types
      default: 0,
    },
    performanceGrade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
      default: "C",
    },
    
    // Financial Metrics
    totalDealValue: {
      type: Number,
      default: 0,
    },
    averageDealValue: {
      type: Number,
      default: 0,
    },
    
    // Productivity Metrics
    activeDays: {
      type: Number, // Days with at least one activity
      default: 0,
    },
    averageActivitiesPerDay: {
      type: Number,
      default: 0,
    },
    
    // Ranking
    rank: {
      type: Number,
      default: 0,
    },
    
    // Additional metadata
    notes: {
      type: String,
      default: "",
    },
    isCalculated: {
      type: Boolean,
      default: false,
    },
    calculatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique agent-period combinations
AgentKPISchema.index({ agent: 1, period: 1, startDate: 1 }, { unique: true });
AgentKPISchema.index({ period: 1, endDate: -1 });
AgentKPISchema.index({ activityScore: -1 });
AgentKPISchema.index({ performanceGrade: 1 });

export default mongoose.models.AgentKPI || mongoose.model("AgentKPI", AgentKPISchema);