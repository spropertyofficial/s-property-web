#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

console.log('🔧 Testing environment variables...');
console.log('MongoDB:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
console.log('Cloudinary Cloud:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Found' : '❌ Missing');
console.log('Cloudinary API Key:', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? '✅ Found' : '❌ Missing');
console.log('Cloudinary Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Found' : '❌ Missing');

// Test imports
try {
  console.log('\n🔍 Testing imports...');
  console.log('Testing residentials data import...');
  const { residentialsData } = await import('../src/data/residentials.js');
  console.log(`✅ Residentials data imported: ${residentialsData.length} properties`);
  
  console.log('Testing mongoose import...');
  const mongoose = await import('mongoose');
  console.log('✅ Mongoose imported');
  
  console.log('Testing Property model import...');
  const Property = await import('../src/lib/models/Property.js');
  console.log('✅ Property model imported');
  
  console.log('\n🎉 All imports successful!');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error(error.stack);
}
