// app/api/submit-form/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// URL Google Apps Script web app Anda
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby0t3tR-2V-QnD7x__p12zDWT66i9L2lrtILSObJb8S37IfHiqlQRDUby2SZL7_J7ZPrg/exec";

export async function POST(request) {
  try {
    // Dapatkan data dari request
    const formData = await request.json();

    console.log("Submitting data to Google Apps Script...");
    console.log("Payload:", JSON.stringify(formData, null, 2));

    // Kirim data ke Google Apps Script
    const response = await axios.post(GOOGLE_SCRIPT_URL, formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Log response untuk debugging
    console.log("Google Apps Script response status:", response.status);
    console.log("Google Apps Script response data:", response.data);

    // Pastikan respons selalu dalam format JSON
    return NextResponse.json(
      {
        success: response.status === 200,
        message: response.data?.message || "Proses selesai",
        details: response.data,
      },
      {
        status: response.status,
      }
    );
  } catch (error) {
    // Log error detail
    console.error("Submission error:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);

    // Tangani berbagai jenis error
    if (error.response) {
      // Error response dari server
      return NextResponse.json(
        {
          success: false,
          message: "Error dari server eksternal",
          details: error.response.data,
        },
        { status: error.response.status || 500 }
      );
    } else if (error.request) {
      // Request terkirim tapi tidak ada respons
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada respons dari server",
        },
        { status: 500 }
      );
    } else {
      // Error lainnya
      return NextResponse.json(
        {
          success: false,
          message: "Error saat mengirim data",
          details: error.message,
        },
        { status: 500 }
      );
    }
  }
}
