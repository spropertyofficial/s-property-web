// src/lib/auth.js

import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "./mongodb";
import Admin from "./models/Admin";
import User from "./models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// Universal authentication verifier for both admin and user
// Returns: { success, user, admin, type, error }
export async function verifyAuth(req) {
  await connectDB();
  const token = req.cookies.get("auth-token")?.value;
  if (!token) {
    return {
      success: false,
      error: "Akses ditolak: Token tidak valid atau tidak ada.",
    };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role) {
      const admin = await Admin.findById(decoded.userId).select("-password");
      if (!admin) {
        return { success: false, error: "Admin tidak ditemukan." };
      }
      return { success: true, user: admin};
    } else if (decoded.type) {
      const user = await User.findById(decoded.userId).select("-password");
      if (!user || !user.isActive) {
        return {
          success: false,
          error: "User tidak ditemukan atau tidak aktif.",
        };
      }
      return { success: true, user };
    } else {
      return { success: false, error: "Akses ditolak: Token tidak valid." };
    }
  } catch (error) {
    return {
      success: false,
      error: "Akses ditolak: Token tidak valid.",
    };
  }
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyToken(req) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Enhanced admin verification with role-based access
export async function verifyAdminWithRole(request, requiredRoles = []) {
  try {
    await connectDB();

    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.userId).select("-password");

    if (!admin) {
      return {
        error: NextResponse.json(
          { success: false, message: "Admin not found" },
          { status: 401 }
        ),
      };
    }

    // Check role permissions if requiredRoles specified
    if (requiredRoles.length > 0 && !requiredRoles.includes(admin.role)) {
      return {
        error: NextResponse.json(
          {
            success: false,
            message: `Access denied. Required roles: ${requiredRoles.join(
              ", "
            )}`,
          },
          { status: 403 }
        ),
      };
    }

    return { admin };
  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      ),
    };
  }
}


// Refactored: Use verifyAuth for admin check
export async function verifyAdmin(req) {
  const result = await verifyAuth(req);
  if (!result.success || !(result.user && result.user.role)) {
    return {
      success: false,
      error: result.error || "Akses ditolak: Bukan admin.",
    };
  }
  return { success: true, admin: result.user };
}

// Verify User (for agents and regular users)

// Refactored: Use verifyAuth for user check
export async function verifyUser(req) {
  const result = await verifyAuth(req);
  if (!result.success || !(result.user && !result.user.role)) {
    return {
      success: false,
      error: result.error || "Akses ditolak: Bukan user.",
    };
  }
  return { success: true, user: result.user };
}

// Role permissions mapping
export const PERMISSIONS = {
  superadmin: ["read", "write", "delete", "manage_users", "export"],
  editor: ["read", "write", "export"],
  viewer: ["read"],
};

export const hasPermission = (userRole, requiredPermission) => {
  return PERMISSIONS[userRole]?.includes(requiredPermission) || false;
};

// Helper function to check specific permissions
export const checkPermission = (admin, permission) => {
  return hasPermission(admin.role, permission);
};
