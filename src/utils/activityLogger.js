import connectDB from "@/lib/mongodb";
import AgentActivity from "@/lib/models/AgentActivity";

/**
 * Log an agent activity
 * @param {string} agentId - The agent's user ID
 * @param {string} activityType - Type of activity (see AgentActivity model)
 * @param {string} description - Description of the activity
 * @param {Object} options - Additional options
 * @param {string} options.relatedProperty - Property ID if related
 * @param {string} options.relatedUser - User ID if related
 * @param {Object} options.metadata - Additional metadata
 * @param {number} options.value - Monetary value if applicable
 * @param {string} options.priority - Priority level (low, medium, high, critical)
 * @returns {Promise<Object>} The created activity record
 */
export async function logAgentActivity(agentId, activityType, description, options = {}) {
  try {
    await connectDB();
    
    const activity = new AgentActivity({
      agent: agentId,
      activityType,
      description,
      relatedProperty: options.relatedProperty || null,
      relatedUser: options.relatedUser || null,
      metadata: options.metadata || {},
      value: options.value || 0,
      priority: options.priority || "medium",
      status: options.status || "completed"
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error logging agent activity:", error);
    throw error;
  }
}

/**
 * Get activity statistics for an agent
 * @param {string} agentId - The agent's user ID
 * @param {Date} startDate - Start date for the period
 * @param {Date} endDate - End date for the period
 * @returns {Promise<Object>} Activity statistics
 */
export async function getAgentActivityStats(agentId, startDate, endDate) {
  try {
    await connectDB();
    
    const activities = await AgentActivity.find({
      agent: agentId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const stats = {
      total: activities.length,
      byType: {},
      byPriority: {},
      totalValue: 0,
      activeDays: 0
    };

    const activeDaysSet = new Set();
    
    activities.forEach(activity => {
      // Count by type
      stats.byType[activity.activityType] = (stats.byType[activity.activityType] || 0) + 1;
      
      // Count by priority
      stats.byPriority[activity.priority] = (stats.byPriority[activity.priority] || 0) + 1;
      
      // Sum total value
      stats.totalValue += activity.value || 0;
      
      // Track active days
      activeDaysSet.add(activity.createdAt.toDateString());
    });

    stats.activeDays = activeDaysSet.size;
    
    return stats;
  } catch (error) {
    console.error("Error getting agent activity stats:", error);
    throw error;
  }
}

/**
 * Activity types enum for easy reference
 */
export const ACTIVITY_TYPES = {
  PROPERTY_CREATED: "property_created",
  PROPERTY_UPDATED: "property_updated", 
  PROPERTY_VIEWED: "property_viewed",
  CLIENT_CONTACTED: "client_contacted",
  CLIENT_MEETING: "client_meeting",
  PROPERTY_SHOWN: "property_shown",
  INQUIRY_RECEIVED: "inquiry_received",
  INQUIRY_RESPONDED: "inquiry_responded",
  DEAL_NEGOTIATED: "deal_negotiated",
  DEAL_CLOSED: "deal_closed",
  LOGIN: "login",
  PROFILE_UPDATED: "profile_updated"
};

/**
 * Priority levels enum
 */
export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
};