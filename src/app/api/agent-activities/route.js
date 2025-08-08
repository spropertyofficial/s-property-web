import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AgentActivity from "@/lib/models/AgentActivity";
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

// POST - Log agent activity
export async function POST(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { activityType, description, relatedProperty, relatedUser, metadata, value, priority } = body;

    await connectDB();

    // Create new activity
    const activity = new AgentActivity({
      agent: user._id,
      activityType,
      description,
      relatedProperty: relatedProperty || null,
      relatedUser: relatedUser || null,
      metadata: metadata || {},
      value: value || 0,
      priority: priority || "medium",
      status: "completed"
    });

    await activity.save();

    return NextResponse.json({
      success: true,
      activity: activity,
      message: "Activity logged successfully"
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}

// GET - Fetch agent activities
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
    const activityType = searchParams.get("activityType");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    let query = {};

    // If admin, can view any agent's activities, otherwise only own
    if (user.type === "admin" || user.type === "sales-inhouse") {
      if (agentId) {
        query.agent = agentId;
      }
    } else {
      query.agent = user._id;
    }

    if (activityType) {
      query.activityType = activityType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const activities = await AgentActivity.find(query)
      .populate("agent", "name email agentCode")
      .populate("relatedProperty", "name")
      .populate("relatedUser", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await AgentActivity.countDocuments(query);

    return NextResponse.json({
      success: true,
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}