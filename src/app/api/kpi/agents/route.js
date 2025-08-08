import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AgentActivity from "@/lib/models/AgentActivity";
import AgentKPI from "@/lib/models/AgentKPI";
import User from "@/lib/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper function to get user from token
async function getUserFromToken(req) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return null;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}

// Calculate KPI for specific agent and period
async function calculateAgentKPI(agentId, period, startDate, endDate) {
  try {
    // Get all activities for the period
    const activities = await AgentActivity.find({
      agent: agentId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Count different activity types
    const metrics = {
      totalActivities: activities.length,
      propertiesCreated: activities.filter(a => a.activityType === "property_created").length,
      propertiesUpdated: activities.filter(a => a.activityType === "property_updated").length,
      clientsContacted: activities.filter(a => a.activityType === "client_contacted").length,
      inquiriesReceived: activities.filter(a => a.activityType === "inquiry_received").length,
      inquiriesResponded: activities.filter(a => a.activityType === "inquiry_responded").length,
      propertiesShown: activities.filter(a => a.activityType === "property_shown").length,
      dealsNegotiated: activities.filter(a => a.activityType === "deal_negotiated").length,
      dealsClosed: activities.filter(a => a.activityType === "deal_closed").length,
    };

    // Calculate response rate
    const responseRate = metrics.inquiriesReceived > 0 
      ? (metrics.inquiriesResponded / metrics.inquiriesReceived * 100) 
      : 0;

    // Calculate conversion rate
    const conversionRate = metrics.inquiriesReceived > 0 
      ? (metrics.dealsClosed / metrics.inquiriesReceived * 100) 
      : 0;

    // Calculate total deal value
    const dealActivities = activities.filter(a => a.activityType === "deal_closed");
    const totalDealValue = dealActivities.reduce((sum, activity) => sum + (activity.value || 0), 0);
    const averageDealValue = dealActivities.length > 0 ? totalDealValue / dealActivities.length : 0;

    // Calculate activity score (weighted scoring system)
    const weights = {
      property_created: 5,
      property_updated: 2,
      property_viewed: 1,
      client_contacted: 3,
      client_meeting: 4,
      property_shown: 6,
      inquiry_received: 2,
      inquiry_responded: 4,
      deal_negotiated: 8,
      deal_closed: 15,
      login: 0.5,
      profile_updated: 1
    };

    const activityScore = activities.reduce((score, activity) => {
      return score + (weights[activity.activityType] || 1);
    }, 0);

    // Calculate performance grade based on activity score
    let performanceGrade = "F";
    if (activityScore >= 200) performanceGrade = "A+";
    else if (activityScore >= 150) performanceGrade = "A";
    else if (activityScore >= 120) performanceGrade = "B+";
    else if (activityScore >= 100) performanceGrade = "B";
    else if (activityScore >= 80) performanceGrade = "C+";
    else if (activityScore >= 60) performanceGrade = "C";
    else if (activityScore >= 40) performanceGrade = "D";

    // Calculate active days
    const activeDays = new Set(activities.map(a => a.createdAt.toDateString())).size;
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const averageActivitiesPerDay = totalDays > 0 ? metrics.totalActivities / totalDays : 0;

    return {
      ...metrics,
      responseRate: Math.round(responseRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      activityScore,
      performanceGrade,
      totalDealValue,
      averageDealValue,
      activeDays,
      averageActivitiesPerDay: Math.round(averageActivitiesPerDay * 100) / 100,
      isCalculated: true,
      calculatedAt: new Date()
    };
  } catch (error) {
    console.error("Error calculating KPI:", error);
    return null;
  }
}

// GET - Get agent KPI data
export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const period = searchParams.get("period") || "monthly";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Set default date range if not provided
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      if (period === "daily") {
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else if (period === "weekly") {
        start = new Date();
        start.setDate(start.getDate() - 7);
      } else if (period === "monthly") {
        start = new Date();
        start.setMonth(start.getMonth() - 1);
      } else if (period === "quarterly") {
        start = new Date();
        start.setMonth(start.getMonth() - 3);
      } else if (period === "yearly") {
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
      }
    }

    // Build query
    let query = { period, startDate: start, endDate: end };

    // If admin, can view any agent's KPI, otherwise only own
    if (user.type === "admin" || user.type === "sales-inhouse") {
      if (agentId) {
        query.agent = agentId;
      }
    } else {
      query.agent = user._id;
    }

    // Try to get existing KPI data
    let kpiData = await AgentKPI.find(query)
      .populate("agent", "name email agentCode")
      .sort({ activityScore: -1 })
      .lean();

    // If no existing data or data is outdated, calculate fresh KPI
    if (kpiData.length === 0 || kpiData.some(kpi => !kpi.isCalculated)) {
      // Get all agents to calculate KPI for
      let agents;
      if (agentId) {
        agents = await User.find({ _id: agentId, type: { $in: ["agent", "semi-agent", "sales-inhouse"] } });
      } else {
        agents = await User.find({ type: { $in: ["agent", "semi-agent", "sales-inhouse"] } });
      }

      kpiData = [];
      for (let agent of agents) {
        const calculatedMetrics = await calculateAgentKPI(agent._id, period, start, end);
        
        if (calculatedMetrics) {
          // Upsert KPI data
          const kpiDoc = await AgentKPI.findOneAndUpdate(
            { agent: agent._id, period, startDate: start },
            {
              agent: agent._id,
              period,
              startDate: start,
              endDate: end,
              ...calculatedMetrics
            },
            { upsert: true, new: true }
          ).populate("agent", "name email agentCode");
          
          kpiData.push(kpiDoc.toObject());
        }
      }

      // Sort by activity score and assign ranks
      kpiData.sort((a, b) => b.activityScore - a.activityScore);
      for (let i = 0; i < kpiData.length; i++) {
        await AgentKPI.findByIdAndUpdate(kpiData[i]._id, { rank: i + 1 });
        kpiData[i].rank = i + 1;
      }
    }

    return NextResponse.json({
      success: true,
      kpiData,
      period,
      dateRange: { start, end }
    });
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}

// POST - Manually trigger KPI calculation
export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || (user.type !== "admin" && user.type !== "sales-inhouse")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { period, startDate, endDate, agentId } = body;

    await connectDB();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get agents to calculate KPI for
    let agents;
    if (agentId) {
      agents = await User.find({ _id: agentId, type: { $in: ["agent", "semi-agent", "sales-inhouse"] } });
    } else {
      agents = await User.find({ type: { $in: ["agent", "semi-agent", "sales-inhouse"] } });
    }

    const calculatedKPIs = [];
    for (let agent of agents) {
      const calculatedMetrics = await calculateAgentKPI(agent._id, period, start, end);
      
      if (calculatedMetrics) {
        const kpiDoc = await AgentKPI.findOneAndUpdate(
          { agent: agent._id, period, startDate: start },
          {
            agent: agent._id,
            period,
            startDate: start,
            endDate: end,
            ...calculatedMetrics
          },
          { upsert: true, new: true }
        ).populate("agent", "name email agentCode");
        
        calculatedKPIs.push(kpiDoc);
      }
    }

    // Sort and assign ranks
    calculatedKPIs.sort((a, b) => b.activityScore - a.activityScore);
    for (let i = 0; i < calculatedKPIs.length; i++) {
      await AgentKPI.findByIdAndUpdate(calculatedKPIs[i]._id, { rank: i + 1 });
      calculatedKPIs[i].rank = i + 1;
    }

    return NextResponse.json({
      success: true,
      message: "KPI calculation completed",
      calculatedCount: calculatedKPIs.length,
      kpiData: calculatedKPIs
    });
  } catch (error) {
    console.error("Error calculating KPI:", error);
    return NextResponse.json(
      { error: "Failed to calculate KPI" },
      { status: 500 }
    );
  }
}