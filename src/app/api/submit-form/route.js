// app/api/submit-form/route.js
import { NextResponse } from "next/server";

// URL Google Apps Script 
const GOOGLE_SCRIPT_URL = 
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycbz9kATRtho_rf8FThLTC8VBSgWp4_ROMFBULIGBkvEcmgrQpfI5mUPnwuzoHDKCS8-7dA/exec";

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
  console.log('Incoming request URL:', GOOGLE_SCRIPT_URL);

  try {
    // Validasi URL
    if (!GOOGLE_SCRIPT_URL) {
      throw new Error('Google Script URL is not defined');
    }

    // Parse request body
    const formData = await request.json();
    console.log('Parsed form data:', JSON.stringify(formData, null, 2));

    // Kirim data ke Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      },
      body: JSON.stringify(formData)
    });

    // Log raw response
    console.log('Google Script response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    // Coba parse respons sebagai JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parsing Error:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Gagal memproses respons dari server',
        details: {
          rawResponse: responseText,
          parseError: parseError.message
        }
      }, { 
        status: 500,
        headers: CORS_HEADERS 
      });
    }

    // Kembalikan respons
    return NextResponse.json({
      success: response.ok,
      message: result?.message || "Proses selesai",
      details: result
    }, { 
      status: response.status,
      headers: CORS_HEADERS 
    });

  } catch (error) {
    // Log error detail
    console.error('Submission Error:', error);

    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat mengirim data",
      details: {
        errorName: error.name,
        errorMessage: error.message
      }
    }, { 
      status: 500,
      headers: CORS_HEADERS 
    });
  }
}