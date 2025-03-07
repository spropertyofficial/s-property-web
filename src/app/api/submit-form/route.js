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
  try {
    const formData = await request.json();

    // Batasi ukuran payload
    const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB
    const payloadSize = JSON.stringify(formData).length;
    
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({
        success: false,
        message: "Ukuran data terlalu besar"
      }, { status: 413 });
    }

    // Potong base64 yang terlalu besar jika perlu
    const safePayload = { ...formData };
    ['ktpFile', 'npwpFile', 'bankBookFile'].forEach(fileKey => {
      if (safePayload[fileKey] && safePayload[fileKey].length > 1000000) {
        safePayload[fileKey] = safePayload[fileKey].slice(0, 1000000);
      }
    });

    // Kirim dengan timeout lebih panjang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      },
      body: JSON.stringify(safePayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      message: result?.message || "Proses selesai",
      details: result
    }, { 
      status: response.status,
      headers: CORS_HEADERS 
    });

  } catch (error) {
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