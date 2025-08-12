import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import User from "@/lib/models/User";

// Fix ActivityLog references
export async function POST(req) {
  try {
    await connectDB();

    // Get first valid user
    const firstUser = await User.findOne({}).select("_id name");
    
    if (!firstUser) {
      return NextResponse.json({
        success: false,
        error: "No users found"
      });
    }

    // Update all ActivityLog entries to reference this user
    const updateResult = await ActivityLog.updateMany(
      {},
      { 
        $set: { 
          agent: firstUser._id 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        userUsed: firstUser,
        updatedCount: updateResult.modifiedCount
      }
    });

  } catch (error) {
    console.error("Fix ActivityLog Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
