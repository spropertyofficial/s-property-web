#!/usr/bin/env node

/**
 * Script untuk test migrasi 1 properti dengan upload Cloudinary
 */

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import FormData from 'form-data';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import Property from '../src/lib/models/Property.js';
import CategoryAssetType from '../src/lib/models/CategoryAssetType.js';
import CategoryMarketStatus from '../src/lib/models/CategoryMarketStatus.js';
import CategoryListingStatus from '../src/lib/models/CategoryListingStatus.js';
import Cluster from '../src/lib/models/Cluster.js';
import Admin from '../src/lib/models/Admin.js';

// Import data residentials
import { residentialsData } from '../src/data/residentials.js';

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

async function uploadImageToCloudinary(imagePath, folder, publicId) {
  try {
    console.log(`     🔄 Preparing upload: ${path.basename(imagePath)}`);
    
    const imageBuffer = await fs.readFile(imagePath);
    const timestamp = Math.round(Date.now() / 1000);
    
    const params = {
      timestamp,
      folder,
      public_id: publicId
    };
    
    const signature = generateCloudinarySignature(params, CLOUDINARY_API_SECRET);
    
    const formData = new FormData();
    formData.append('file', imageBuffer, { 
      filename: path.basename(imagePath),
      contentType: 'image/webp'
    });
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('public_id', publicId);
    
    console.log(`     🌐 Uploading to Cloudinary...`);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`     ✅ Uploaded: ${result.secure_url}`);
    return result;
    
  } catch (error) {
    console.error(`     ❌ Upload failed for ${imagePath}:`, error.message);
    throw error;
  }
}

async function processPropertyGallery(propertyData) {
  const processedGallery = [];
  const publicPath = path.join(__dirname, '..', 'public');
  
  console.log(`   📸 Processing ${propertyData.gallery.length} images...`);
  
  // Limit to first 3 images for testing
  const imagesToProcess = propertyData.gallery.slice(0, 3);
  console.log(`   🧪 Testing with first ${imagesToProcess.length} images only`);
  
  for (const [index, img] of imagesToProcess.entries()) {
    try {
      const imagePath = path.join(publicPath, img.src);
      
      // Check if image file exists
      try {
        await fs.access(imagePath);
      } catch (error) {
        console.warn(`   ⚠️  Image not found: ${img.src}, using original URL`);
        processedGallery.push({
          src: img.src,
          alt: img.alt,
          type: 'property',
          publicId: `legacy/${propertyData.id}/${index + 1}`,
          isLocal: true
        });
        continue;
      }
      
      // Generate Cloudinary folder and publicId
      const propertySlug = propertyData.id;
      const folder = `s-property/perumahan/${propertySlug}`;
      const filename = path.basename(img.src, path.extname(img.src));
      const publicId = `${filename}-${index + 1}`;
      
      console.log(`     🔄 Uploading: ${img.src}`);
      
      // Upload to Cloudinary
      const uploadResult = await uploadImageToCloudinary(imagePath, folder, publicId);
      
      processedGallery.push({
        src: uploadResult.secure_url,
        alt: img.alt,
        type: 'property',
        publicId: uploadResult.public_id,
        isLocal: false
      });
      
      console.log(`     ✅ Uploaded: ${filename}`);
      
    } catch (error) {
      console.error(`     ❌ Failed to upload ${img.src}:`, error.message);
      // Fallback to original URL if upload fails
      processedGallery.push({
        src: img.src,
        alt: img.alt,
        type: 'property',
        publicId: `legacy/${propertyData.id}/${index + 1}`,
        isLocal: true
      });
    }
  }
  
  return processedGallery;
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function ensureCategories() {
  console.log('🔍 Checking and creating necessary categories...');
  
  // Ensure AssetType "Perumahan" exists
  let assetType = await CategoryAssetType.findOne({ name: 'Perumahan' });
  if (!assetType) {
    assetType = await CategoryAssetType.create({
      name: 'Perumahan',
      slug: 'perumahan',
      description: 'Properti perumahan residensial'
    });
    console.log('✅ Created AssetType: Perumahan');
  } else {
    console.log('✅ AssetType "Perumahan" already exists');
  }

  // Ensure MarketStatus "Primary" exists
  let marketStatus = await CategoryMarketStatus.findOne({ name: 'Primary' });
  if (!marketStatus) {
    marketStatus = await CategoryMarketStatus.create({
      name: 'Primary',
      slug: 'primary',
      description: 'Pasar primer properti'
    });
    console.log('✅ Created MarketStatus: Primary');
  } else {
    console.log('✅ MarketStatus "Primary" already exists');
  }

  // Ensure ListingStatus "Dijual" exists
  let listingStatus = await CategoryListingStatus.findOne({ name: 'Dijual' });
  if (!listingStatus) {
    listingStatus = await CategoryListingStatus.create({
      name: 'Dijual',
      slug: 'dijual',
      description: 'Properti tersedia untuk dijual'
    });
    console.log('✅ Created ListingStatus: Dijual');
  } else {
    console.log('✅ ListingStatus "Dijual" already exists');
  }

  return { assetType, marketStatus, listingStatus };
}

async function getOrCreateAdmin() {
  let admin = await Admin.findOne({ email: 'admin@sproperty.com' });
  if (!admin) {
    admin = await Admin.create({
      name: 'System Migration',
      email: 'admin@sproperty.com',
      password: 'temporary',
      role: 'superadmin'
    });
    console.log('✅ Created migration admin user');
  }
  return admin;
}

async function testMigrateOneProperty() {
  console.log('\n📦 Starting TEST migration with Cloudinary upload...');
  
  const { assetType, marketStatus, listingStatus } = await ensureCategories();
  const admin = await getOrCreateAdmin();
  
  // Test with Terravia (first property)
  const propertyData = residentialsData[0];
  
  try {
    console.log(`\n🏠 TEST Migrating: ${propertyData.name}`);
    
    // Check if property already exists
    const existingProperty = await Property.findOne({ id: propertyData.id });
    if (existingProperty) {
      console.log(`   ⚠️  Property ${propertyData.name} already exists, deleting first...`);
      await Property.findByIdAndDelete(existingProperty._id);
    }
    
    // Process gallery images (upload to Cloudinary)
    let gallery = [];
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      gallery = await processPropertyGallery(propertyData);
    } else {
      console.warn('   ⚠️  Cloudinary not configured, using local image URLs');
      gallery = propertyData.gallery.map((img, index) => ({
        src: img.src,
        alt: img.alt,
        type: 'property',
        publicId: `legacy/${propertyData.id}/${index + 1}`,
        isLocal: true
      }));
    }
    
    // Create property
    const property = await Property.create({
      id: propertyData.id,
      name: propertyData.name,
      description: propertyData.description || `${propertyData.name} - Perumahan di ${propertyData.location.area}`,
      startPrice: propertyData.startPrice,
      developer: propertyData.developer,
      location: {
        region: propertyData.location.region,
        city: propertyData.location.city,
        area: propertyData.location.area,
        address: propertyData.location.address,
        mapsLink: propertyData.location.mapsLink
      },
      gallery: gallery,
      assetType: assetType._id,
      marketStatus: marketStatus._id,
      listingStatus: listingStatus._id,
      clusters: [],
      createdBy: admin._id,
      updatedBy: admin._id
    });
    
    console.log(`   ✅ Successfully migrated: ${propertyData.name} with ${gallery.length} images`);
    
    // Show uploaded images
    console.log('\n📷 Uploaded Images:');
    gallery.forEach((img, index) => {
      if (!img.isLocal) {
        console.log(`   ${index + 1}. ${img.src}`);
      }
    });
    
  } catch (error) {
    console.error(`   ❌ Error migrating ${propertyData.name}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting TEST Residential Data Migration with Cloudinary Upload...');
  console.log('🔧 Environment check:');
  console.log(`  - MongoDB URI: ${process.env.MONGODB_URI ? '✅' : '❌'}`);
  console.log(`  - Cloudinary Cloud Name: ${CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);
  console.log(`  - Cloudinary API Key: ${CLOUDINARY_API_KEY ? '✅' : '❌'}`);
  console.log(`  - Cloudinary API Secret: ${CLOUDINARY_API_SECRET ? '✅' : '❌'}\n`);
  
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully\n');
    
    console.log('🏗️  Starting TEST migration process...');
    await testMigrateOneProperty();
    
    console.log('\n🎉 TEST Migration completed successfully!');
    console.log('🔍 Check Cloudinary dashboard to see uploaded images');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

main();
