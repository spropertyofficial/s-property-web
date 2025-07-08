#!/usr/bin/env node

/**
 * Script migrasi residential lengkap dengan upload Cloudinary
 * Berdasarkan test yang berhasil
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
  
  for (const [index, img] of propertyData.gallery.entries()) {
    try {
      const imagePath = path.join(publicPath, img.src);
      
      // Check if image file exists
      try {
        await fs.access(imagePath);
      } catch (error) {
        console.warn(`     ⚠️  Image not found: ${img.src}`);
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
      
      console.log(`     🔄 Uploading ${index + 1}/${propertyData.gallery.length}: ${path.basename(img.src)}`);
      
      // Upload to Cloudinary
      const uploadResult = await uploadImageToCloudinary(imagePath, folder, publicId);
      
      processedGallery.push({
        src: uploadResult.secure_url,
        alt: img.alt,
        type: 'property',
        publicId: uploadResult.public_id,
        isLocal: false
      });
      
      console.log(`     ✅ Success: ${path.basename(img.src)}`);
      
    } catch (error) {
      console.error(`     ❌ Failed to upload ${img.src}:`, error.message);
      // Fallback to legacy format
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
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function ensureCategories() {
  console.log('🔍 Checking categories...');
  
  const assetType = await CategoryAssetType.findOne({ name: 'Perumahan' });
  const marketStatus = await CategoryMarketStatus.findOne({ name: 'Primary' });
  const listingStatus = await CategoryListingStatus.findOne({ name: 'Dijual' });
  
  if (!assetType || !marketStatus || !listingStatus) {
    throw new Error('Required categories not found. Please run category setup first.');
  }
  
  console.log('✅ All required categories found');
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

async function migrateClusters(propertyData, propertyId) {
  const clusters = [];
  
  if (propertyData.clusters && propertyData.clusters.length > 0) {
    for (const clusterName of propertyData.clusters) {
      let clustersList = [];
      
      if (typeof clusterName === 'string') {
        clustersList = [clusterName];
      } else if (typeof clusterName === 'object') {
        Object.values(clusterName).forEach(subClusters => {
          if (Array.isArray(subClusters)) {
            clustersList.push(...subClusters);
          }
        });
      }
      
      for (const name of clustersList) {
        if (typeof name === 'string' && name.trim()) {
          let cluster = await Cluster.findOne({ 
            name: name,
            property: propertyId 
          });
          
          if (!cluster) {
            cluster = await Cluster.create({
              name: name,
              slug: name.toLowerCase().replace(/\s+/g, '-'),
              property: propertyId,
              description: `Cluster ${name} di ${propertyData.name}`
            });
          }
          
          clusters.push(cluster._id);
        }
      }
    }
  }
  
  return clusters;
}

async function migrateProperties() {
  console.log('\n🚀 Starting full migration with Cloudinary upload...');
  
  const { assetType, marketStatus, listingStatus } = await ensureCategories();
  const admin = await getOrCreateAdmin();
  
  let successCount = 0;
  let errorCount = 0;
  let totalImages = 0;
  let uploadedImages = 0;
  
  for (const [index, propertyData] of residentialsData.entries()) {
    try {
      console.log(`\n🏠 [${index + 1}/${residentialsData.length}] Migrating: ${propertyData.name}`);
      
      // Check if property already exists
      const existingProperty = await Property.findOne({ id: propertyData.id });
      if (existingProperty) {
        console.log(`   ⚠️  Property exists, skipping...`);
        continue;
      }
      
      // Process gallery images
      let gallery = [];
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        gallery = await processPropertyGallery(propertyData);
        totalImages += propertyData.gallery.length;
        uploadedImages += gallery.filter(img => !img.isLocal).length;
      } else {
        console.warn('   ⚠️  Cloudinary not configured');
        gallery = propertyData.gallery.map((img, idx) => ({
          src: img.src,
          alt: img.alt,
          type: 'property',
          publicId: `legacy/${propertyData.id}/${idx + 1}`,
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
        location: propertyData.location,
        gallery: gallery,
        assetType: assetType._id,
        marketStatus: marketStatus._id,
        listingStatus: listingStatus._id,
        clusters: [],
        createdBy: admin._id,
        updatedBy: admin._id
      });
      
      // Migrate clusters
      const clusterIds = await migrateClusters(propertyData, property._id);
      if (clusterIds.length > 0) {
        await Property.findByIdAndUpdate(property._id, { clusters: clusterIds });
        console.log(`   ✅ Added ${clusterIds.length} clusters`);
      }
      
      console.log(`   ✅ Success: ${propertyData.name} (${gallery.filter(img => !img.isLocal).length}/${gallery.length} images uploaded)`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Error migrating ${propertyData.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Success: ${successCount} properties`);
  console.log(`❌ Errors: ${errorCount} properties`);
  console.log(`📷 Images: ${uploadedImages}/${totalImages} uploaded to Cloudinary`);
  console.log(`📝 Total: ${residentialsData.length} properties in source data`);
}

async function main() {
  console.log('🚀 Starting Residential Data Migration with Cloudinary Upload...');
  console.log(`📂 Found ${residentialsData.length} properties to migrate`);
  
  try {
    await connectDB();
    await migrateProperties();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('🔍 Check your Cloudinary dashboard and admin panel');
    
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
