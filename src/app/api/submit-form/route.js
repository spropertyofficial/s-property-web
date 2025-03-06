// app/api/submit-form/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// Gunakan environment variable dengan fallback
const GOOGLE_SCRIPT_URL = 
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycby0t3tR-2V-QnD7x__p12zDWT66i9L2lrtILSObJb8S37IfHiqlQRDUby2SZL7_J7ZPrg/exec";

// CORS Headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS
  });
}

export async function POST(request) {
  // Log request details
  console.log('Incoming request URL:', GOOGLE_SCRIPT_URL);
  console.log('Request method:', request.method);

  try {
    // Parse request body
    const formData = await request.json();
    console.log('Parsed form data:', JSON.stringify(formData, null, 2));

    // Axios configuration
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      },
      timeout: 10000 // 10 second timeout
    };

    // Send data to Google Apps Script
    const response = await axios.post(GOOGLE_SCRIPT_URL, formData, axiosConfig);

    console.log('Google Script response status:', response.status);
    console.log('Google Script response data:', response.data);

    // Return response with CORS headers
    return NextResponse.json(
      {
        success: response.status === 200,
        message: response.data?.message || "Proses selesai",
        details: response.data
      }, 
      { 
        status: response.status,
        headers: CORS_HEADERS 
      }
    );

  } catch (error) {
    // Detailed error logging
    console.error('Submission Error:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }

    if (error.request) {
      console.error('Request Details:', error.request);
    }

    return NextResponse.json(
      {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan saat mengirim data",
        details: {
          errorName: error.name,
          errorMessage: error.message,
          responseStatus: error.response?.status,
          responseData: error.response?.data
        }
      },
      { 
        status: error.response?.status || 500,
        headers: CORS_HEADERS 
      }
    );
  }
}