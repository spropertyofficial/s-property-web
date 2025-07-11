// src/lib/auth.js
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "./mongodb";
import Admin from "./models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function verifyToken(req) {
  const token = req.cookies.get("token")?.value;
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
    
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return {
        error: NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        )
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return {
        error: NextResponse.json(
          { success: false, message: "Admin not found" },
          { status: 401 }
        )
      };
    }

    // Check role permissions if requiredRoles specified
    if (requiredRoles.length > 0 && !requiredRoles.includes(admin.role)) {
      return {
        error: NextResponse.json(
          { success: false, message: `Access denied. Required roles: ${requiredRoles.join(', ')}` },
          { status: 403 }
        )
      };
    }

    return { admin };

  } catch (error) {
    return {
      error: NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    };
  }
}

export async function verifyAdmin(req) {
  await connectDB();

  // Panggil fungsi Anda yang sudah ada
  const decodedToken = verifyToken(req);

  if (!decodedToken) {
    return {
      success: false,
      error: "Akses ditolak: Token tidak valid atau tidak ada.",
    };
  }

  try {
    const admin = await Admin.findById(
      decodedToken.id || decodedToken.adminId
    ).select("-password");

    if (!admin) {
      return { success: false, error: "Admin tidak ditemukan." };
    }

    return { success: true, admin };
  } catch (error) {
    console.error("Verify admin error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat verifikasi admin.",
    };
  }
}

// Role permissions mapping
export const PERMISSIONS = {
  superadmin: ["read", "write", "delete", "manage_users", "export"],
  editor: ["read", "write", "export"],
  viewer: ["read"]
};

export const hasPermission = (userRole, requiredPermission) => {
  return PERMISSIONS[userRole]?.includes(requiredPermission) || false;
};

// Helper function to check specific permissions
export const checkPermission = (admin, permission) => {
  return hasPermission(admin.role, permission);
};
