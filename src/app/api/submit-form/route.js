// app/api/submit-form/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// URL Google Apps Script web app Anda
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxN9tpGxZR-ucpFpisoIWBh7EkWBxH3RgAANdqhdwVB55JbsXHm5WrOMeJSfOb-ou0FvQ/exec';

export async function POST(request) {
  try {
    // Dapatkan data dari request
    const formData = await request.json();
    
    console.log('Submitting data to Google Apps Script...');
    
    // Kirim data ke Google Apps Script
    const response = await axios.post(
      GOOGLE_SCRIPT_URL,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: false // Untuk mendapatkan response meskipun error
      }
    );
    
    // Log response untuk debugging
    console.log('Google Apps Script response status:', response.status);
    if (response.data) {
      console.log('Google Apps Script response:', response.data);
    }
    
    // Jika response sukses
    if (response.status === 200 && response.data && response.data.result === 'success') {
      return NextResponse.json({ success: true, message: 'Data berhasil disimpan' });
    }
    
    // Jika error dari Google Apps Script
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error dari Google Apps Script', 
        details: response.data || 'No response data'
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error saat mengirim data', 
        details: error.message
      },
      { status: 500 }
    );
  }
}