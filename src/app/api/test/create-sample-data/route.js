import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AgentActivity from "@/lib/models/AgentActivity";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();

    // Create a test agent if none exists
    const existingAgent = await User.findOne({ type: "agent" });
    let testAgent;
    
    if (!existingAgent) {
      const hashedPassword = await bcrypt.hash("password123", 12);
      testAgent = new User({
        email: "test.agent@example.com",
        password: hashedPassword,
        name: "Test Agent",
        phone: "+62812345678",
        type: "agent"
      });
      await testAgent.save();
    } else {
      testAgent = existingAgent;
    }

    // Create sample activities
    const sampleActivities = [
      {
        agent: testAgent._id,
        activityType: "login",
        description: "User logged in successfully",
        priority: "low"
      },
      {
        agent: testAgent._id,
        activityType: "property_created",
        description: "Created new property: Villa Paradise",
        priority: "high"
      },
      {
        agent: testAgent._id,
        activityType: "client_contacted",
        description: "Called potential client for property inquiry",
        priority: "medium"
      },
      {
        agent: testAgent._id,
        activityType: "inquiry_received",
        description: "Received inquiry for Villa Paradise",
        priority: "high"
      },
      {
        agent: testAgent._id,
        activityType: "inquiry_responded",
        description: "Responded to client inquiry about Villa Paradise",
        priority: "high"
      },
      {
        agent: testAgent._id,
        activityType: "property_shown",
        description: "Showed Villa Paradise to potential buyer",
        priority: "high"
      },
      {
        agent: testAgent._id,
        activityType: "deal_negotiated",
        description: "Negotiating deal for Villa Paradise",
        value: 50000000,
        priority: "critical"
      },
      {
        agent: testAgent._id,
        activityType: "deal_closed",
        description: "Successfully closed deal for Villa Paradise",
        value: 50000000,
        priority: "critical"
      }
    ];

    // Clear existing activities for this agent
    await AgentActivity.deleteMany({ agent: testAgent._id });

    // Insert sample activities with different timestamps
    for (let i = 0; i < sampleActivities.length; i++) {
      const activity = new AgentActivity({
        ...sampleActivities[i],
        createdAt: new Date(Date.now() - (sampleActivities.length - i) * 3600000) // Spread over hours
      });
      await activity.save();
    }

    // Create another test agent for comparison
    const hashedPassword2 = await bcrypt.hash("password123", 12);
    let testAgent2 = await User.findOne({ email: "test.agent2@example.com" });
    
    if (!testAgent2) {
      testAgent2 = new User({
        email: "test.agent2@example.com",
        password: hashedPassword2,
        name: "Test Agent 2",
        phone: "+62812345679",
        type: "agent"
      });
      await testAgent2.save();
    }

    // Create fewer activities for agent 2
    const sampleActivities2 = [
      {
        agent: testAgent2._id,
        activityType: "login",
        description: "User logged in successfully",
        priority: "low"
      },
      {
        agent: testAgent2._id,
        activityType: "property_viewed",
        description: "Viewed property listings",
        priority: "low"
      },
      {
        agent: testAgent2._id,
        activityType: "client_contacted",
        description: "Called potential client",
        priority: "medium"
      }
    ];

    await AgentActivity.deleteMany({ agent: testAgent2._id });

    for (let i = 0; i < sampleActivities2.length; i++) {
      const activity = new AgentActivity({
        ...sampleActivities2[i],
        createdAt: new Date(Date.now() - (sampleActivities2.length - i) * 3600000)
      });
      await activity.save();
    }

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      agents: [
        { id: testAgent._id, name: testAgent.name, activities: sampleActivities.length },
        { id: testAgent2._id, name: testAgent2.name, activities: sampleActivities2.length }
      ]
    });

  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: "Failed to create test data", details: error.message },
      { status: 500 }
    );
  }
}