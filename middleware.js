import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("Middleware triggered for:", pathname); // Debug log

  // Skip middleware for login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    console.log("Skipping middleware for:", pathname); // Debug log
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    try {
      const token = request.cookies.get("token");
      console.log("Token found:", token ? "YES" : "NO"); // Debug log

      if (!token) {
        console.log("No token, redirecting to login"); // Debug log
        return redirectToLogin(request);
      }

      // Verify JWT token
      const decoded = jwt.verify(token.value, JWT_SECRET);
      console.log("Token verified for user:", decoded.id); // Debug log

      return NextResponse.next();
    } catch (error) {
      console.error("JWT verification failed:", error.message); // Debug log
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request) {
  console.log("Redirecting to login from:", request.nextUrl.pathname); // Debug log
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl);

  // Clear invalid cookies
  response.cookies.delete("token");

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
