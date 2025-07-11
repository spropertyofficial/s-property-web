import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fileType = formData.get("fileType");
    const applicantName = formData.get("applicantName") || "unknown";
    const registrationId = formData.get("registrationId") || Date.now().toString();

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid file type. Only JPG, PNG, and PDF are allowed." 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          message: "File size too large. Maximum size is 5MB." 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize applicant name for folder structure
    const sanitizedName = applicantName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 30); // Limit length
    
    // Create organized folder structure
    const timestamp = Date.now();
    const folderPath = `s-property/registrations/${sanitizedName}-${registrationId}`;
    const publicId = `${folderPath}/${fileType}`;

    // Upload to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          transformation: file.type.startsWith("image/") ? [
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ] : undefined,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        resourceType: uploadResponse.resource_type,
        format: uploadResponse.format,
        bytes: uploadResponse.bytes,
        width: uploadResponse.width || null,
        height: uploadResponse.height || null,
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
