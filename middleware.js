import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("Middleware triggered for:", pathname); // Debug log

  // Routes that require authentication
const protectedRoutes = ["/agent", "/dashboard", "/chat"];

  // Routes that should redirect authenticated users
  const authRoutes = ["/login", "/register"];

  // Skip middleware for API routes (except auth API)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    console.log("Skipping middleware for API route:", pathname);
    return NextResponse.next();
  }

  // Handle admin routes (existing logic)
  if (pathname === "/admin/login" || pathname.startsWith("/api/")) {
    console.log("Skipping middleware for admin/API:", pathname);
    return NextResponse.next();
  }

  // Protect admin routes (existing logic)
  if (pathname.startsWith("/admin")) {
    try {
      const token = request.cookies.get("token");
      console.log("Admin token found:", token ? "YES" : "NO");

      if (!token) {
        console.log("No admin token, redirecting to admin login");
        return redirectToAdminLogin(request);
      }

      // Verify JWT token for admin
      const decoded = jwt.verify(token.value, JWT_SECRET);
      console.log("Admin token verified for user:", decoded.id);

      return NextResponse.next();
    } catch (error) {
      console.error("Admin JWT verification failed:", error.message);
      return redirectToAdminLogin(request);
    }
  }

  // Get auth token for agent/user routes
  const authToken = request.cookies.get("auth-token");

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    console.log("Protected route accessed:", pathname);

    if (!authToken) {
      console.log("No auth token, redirecting to login");
      return redirectToLogin(request);
    }

    try {
      // Verify JWT token for agents/users
      const decoded = jwt.verify(authToken.value, JWT_SECRET);
      console.log(
        "Auth token verified for user:",
        decoded.email,
        "Type:",
        decoded.type
      );

      // Check if user is agent for agent routes
      if (pathname.startsWith("/agent") && decoded.type !== "agent") {
        console.log("Non-agent trying to access agent route");
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Check if user is active
      if (!decoded.isActive) {
        console.log("Inactive user trying to access protected route");
        return redirectToLogin(request);
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Auth JWT verification failed:", error.message);
      return redirectToLogin(request);
    }
  }

  if (isAuthRoute && authToken) {
    try {
      // If valid token exists, redirect to home
      const decoded = jwt.verify(authToken.value, JWT_SECRET);
      console.log(
        "Authenticated user accessing auth route, redirecting to home"
      );
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      // Invalid token, continue to auth route
      console.log("Invalid token on auth route, allowing access");
    }
  }

  return NextResponse.next();
}

// Existing admin redirect function
function redirectToAdminLogin(request) {
  console.log("Redirecting to admin login from:", request.nextUrl.pathname);
  const loginUrl = new URL("/admin/login", request.url);
  const response = NextResponse.redirect(loginUrl);

  // Clear invalid admin cookies
  response.cookies.delete("token");

  return response;
}

// New auth redirect function
function redirectToLogin(request) {
  console.log("Redirecting to login from:", request.nextUrl.pathname);
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);

  // Clear invalid auth cookies
  response.cookies.delete("auth-token");

  return response;
}
export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
    "/login",
    "/register",
  ],
};