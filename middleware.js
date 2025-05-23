import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

// Proteksi semua /admin kecuali /admin/login
export const config = {
  matcher: ["/admin/:path*"],
};
