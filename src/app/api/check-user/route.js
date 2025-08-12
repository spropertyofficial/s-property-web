import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";

// Check current logged in user
export async function GET(req) {
  try {
    const { success, user } = await verifyUser(req);
    
    const authToken = req.cookies.get("auth-token")?.value;
    
    return NextResponse.json({
      success,
      hasToken: !!authToken,
      tokenLength: authToken?.length || 0,
      user: success ? {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        agentCode: user.agentCode,
        isActive: user.isActive
      } : null,
      error: success ? null : "User not authenticated"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      hasToken: !!req.cookies.get("auth-token")?.value
    });
  }
}
