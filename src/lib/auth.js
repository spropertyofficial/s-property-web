// src/lib/auth.js
import jwt from "jsonwebtoken";
import connectDB from "./mongodb";
import Admin from "./models/Admin";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function verifyToken(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
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
