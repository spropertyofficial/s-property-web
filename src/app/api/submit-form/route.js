// app/api/submit-form/route.js
import { NextResponse } from "next/server";

// Hapus axios, gunakan fetch native
const GOOGLE_SCRIPT_URL = 
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycbymsVxTqIq1WLT46DTEwce5-ZUo9hTsJNWBP-tOvvl8xO9LEA2du79RvJ7CztV7BorT-g/exec";

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
  console.log('Request method:', request.method);

  try {
    const formData = await request.json();
    console.log('Parsed form data:', JSON.stringify(formData, null, 2));

    // Gunakan fetch dengan timeout manual
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Google Script response status:', response.status);
      
      const result = await response.json();
      console.log('Google Script response data:', result);

      return NextResponse.json(
        {
          success: response.ok,
          message: result?.message || "Proses selesai",
          details: result
        }, 
        { 
          status: response.status,
          headers: CORS_HEADERS 
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch Error:', fetchError);

      return NextResponse.json(
        {
          success: false,
          message: "Gagal terhubung ke server",
          details: {
            errorName: fetchError.name,
            errorMessage: fetchError.message
          }
        },
        { 
          status: 500,
          headers: CORS_HEADERS 
        }
      );
    }

  } catch (error) {
    console.error('Submission Error:', error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses data",
        details: {
          errorName: error.name,
          errorMessage: error.message
        }
      },
      { 
        status: 500,
        headers: CORS_HEADERS 
      }
    );
  }
}