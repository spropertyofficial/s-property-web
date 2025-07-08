#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

function generateCloudinarySignature(params, apiSecret) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const stringToSign = sortedParams + apiSecret;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

async function testCloudinaryUpload() {
  console.log('🧪 Testing Cloudinary Upload...');
  console.log(`Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`API Key: ${CLOUDINARY_API_KEY}`);
  console.log(`API Secret: ${CLOUDINARY_API_SECRET ? 'Set' : 'Missing'}`);
  
  // Test image path
  const testImagePath = path.join(__dirname, '..', 'public', 'images', 'Residentials', 'terravia-bsd-city', 'terravia-overview-21.webp');
  
  console.log(`\n📸 Test image: ${testImagePath}`);
  
  try {
    // Check if file exists
    await fs.access(testImagePath);
    console.log('✅ Test image found');
    
    const imageBuffer = await fs.readFile(testImagePath);
    console.log(`📏 Image size: ${imageBuffer.length} bytes`);
    
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 's-property/perumahan/terravia/test';
    const publicId = `${folder}/test-upload-${timestamp}`;
    
    const params = {
      timestamp,
      folder,
      public_id: publicId
    };
    
    const signature = generateCloudinarySignature(params, CLOUDINARY_API_SECRET);
    console.log(`🔐 Generated signature: ${signature}`);
    
    const formData = new FormData();
    formData.append('file', imageBuffer, { 
      filename: 'test-image.webp',
      contentType: 'image/webp'
    });
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', publicId);
    
    console.log('\n🌐 Uploading to Cloudinary...');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Upload successful!');
    console.log(`🔗 URL: ${result.secure_url}`);
    console.log(`🆔 Public ID: ${result.public_id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testCloudinaryUpload();
