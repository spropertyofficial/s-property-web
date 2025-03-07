// app/api/submit-form/route.js
import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = 
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || 
  "https://script.google.com/macros/s/AKfycbz9kATRtho_rf8FThLTC8VBSgWp4_ROMFBULIGBkvEcmgrQpfI5mUPnwuzoHDKCS8-7dA/exec";

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
    const formData = await request.json();
    console.log('Payload size:', JSON.stringify(formData).length, 'bytes');

    // Optional: Truncate base64 files for logging
    const logSafePayload = {
      ...formData,
      ktpFile: formData.ktpFile ? `[Base64 KTP, ${formData.ktpFile.slice(0, 50)}...]` : null,
      npwpFile: formData.npwpFile ? `[Base64 NPWP, ${formData.npwpFile.slice(0, 50)}...]` : null,
      bankBookFile: formData.bankBookFile ? `[Base64 Bank Book, ${formData.bankBookFile.slice(0, 50)}...]` : null
    };
    console.log('Payload details:', JSON.stringify(logSafePayload, null, 2));

    // Gunakan fetch dengan timeout eksplisit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 detik

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