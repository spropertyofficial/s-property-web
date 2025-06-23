// src/app/api/sign-cloudinary-upload/route.js

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    const body = await req.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json(
        { error: "Missing parameters to sign" },
        { status: 400 }
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Error signing upload params:", error);
    return NextResponse.json(
      { error: "Failed to sign upload parameters" },
      { status: 500 }
    );
  }
}
