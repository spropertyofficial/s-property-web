import { NextResponse } from "next/server";

export async function POST() {
  console.log("Logout API called"); // Debug log

  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil",
  });

  // Clear cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Set to past date to delete
  });

  console.log("Cookie cleared"); // Debug log

  return response;
}
