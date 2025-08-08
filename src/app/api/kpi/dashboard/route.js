import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AgentActivity from "@/lib/models/AgentActivity";
import AgentKPI from "@/lib/models/AgentKPI";
import User from "@/lib/models/User";
import Property from "@/lib/models/Property";
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

// GET - Get dashboard summary data
export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || (user.type !== "admin" && user.type !== "sales-inhouse")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly";
    
    // Set date range based on period
    const end = new Date();
    let start = new Date();
    
    if (period === "daily") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (period === "weekly") {
      start.setDate(start.getDate() - 7);
    } else if (period === "monthly") {
      start.setMonth(start.getMonth() - 1);
    } else if (period === "quarterly") {
      start.setMonth(start.getMonth() - 3);
    } else if (period === "yearly") {
      start.setFullYear(start.getFullYear() - 1);
    }

    // Get total counts
    const totalAgents = await User.countDocuments({ type: { $in: ["agent", "semi-agent", "sales-inhouse"] } });
    const totalProperties = await Property.countDocuments();
    
    // Get activities for the period
    const totalActivities = await AgentActivity.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });

    // Get top performing agents (latest KPI data)
    const topAgents = await AgentKPI.find({ period })
      .populate("agent", "name email agentCode")
      .sort({ activityScore: -1 })
      .limit(5)
      .lean();

    // Get recent activities
    const recentActivities = await AgentActivity.find({
      createdAt: { $gte: start, $lte: end }
    })
      .populate("agent", "name agentCode")
      .populate("relatedProperty", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Activity type statistics for the period
    const activityTypeStats = await AgentActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
          totalValue: { $sum: "$value" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily activity trends (last 30 days for chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await AgentActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Agent performance summary
    const agentStats = await AgentKPI.aggregate([
      { 
        $match: { period } 
      },
      {
        $group: {
          _id: "$performanceGrade",
          count: { $sum: 1 },
          avgScore: { $avg: "$activityScore" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate total deals and deal value
    const dealStats = await AgentActivity.aggregate([
      {
        $match: {
          activityType: "deal_closed",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalDeals: { $sum: 1 },
          totalValue: { $sum: "$value" },
          avgValue: { $avg: "$value" }
        }
      }
    ]);

    const dealSummary = dealStats.length > 0 ? dealStats[0] : {
      totalDeals: 0,
      totalValue: 0,
      avgValue: 0
    };

    return NextResponse.json({
      success: true,
      summary: {
        period,
        dateRange: { start, end },
        totalAgents,
        totalProperties,
        totalActivities,
        totalDeals: dealSummary.totalDeals,
        totalDealValue: dealSummary.totalValue,
        averageDealValue: dealSummary.avgValue
      },
      topAgents,
      recentActivities,
      activityTypeStats,
      dailyTrends,
      agentStats,
      dealSummary
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}