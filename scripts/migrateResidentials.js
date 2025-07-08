#!/usr/bin/env node

/**
 * Script untuk migrasi data residentials dari file statis ke database
 * Usage: node scripts/migrateResidentials.js
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

/**
 * Generate Cloudinary signature for upload
 */
function generateCloudinarySignature(params, apiSecret) {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Create signature
  const stringToSign = sortedParams + apiSecret;
  return crypto.createHash('sha1').update(stringToSign).digest('hex');
}

/**
 * Upload image to Cloudinary
 */
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
    formData.append('file', imageBuffer);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
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
      const error = await response.text();
      throw new Error(`Cloudinary upload failed: ${error}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error(`Error uploading ${imagePath}:`, error.message);
    throw error;
  }
}

/**
 * Process and upload property gallery images
 */
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
        console.warn(`   ⚠️  Image not found: ${img.src}, using original URL`);
        processedGallery.push({
          src: img.src,
          alt: img.alt,
          type: 'property',
          publicId: null, // No Cloudinary publicId
          isLocal: true
        });
        continue;
      }
      
      // Generate Cloudinary folder and publicId
      const propertySlug = propertyData.id;
      const folder = `s-property/perumahan/${propertySlug}`;
      const filename = path.basename(img.src, path.extname(img.src));
      const publicId = `${folder}/${filename}-${index + 1}`;
      
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
        publicId: null,
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

  // Ensure MarketStatus "SALE" exists
  let marketStatus = await CategoryMarketStatus.findOne({ name: 'SALE' });
  if (!marketStatus) {
    marketStatus = await CategoryMarketStatus.create({
      name: 'SALE',
      slug: 'sale',
      description: 'Properti untuk dijual'
    });
    console.log('✅ Created MarketStatus: SALE');
  } else {
    console.log('✅ MarketStatus "SALE" already exists');
  }

  // Ensure ListingStatus "Active" exists
  let listingStatus = await CategoryListingStatus.findOne({ name: 'Active' });
  if (!listingStatus) {
    listingStatus = await CategoryListingStatus.create({
      name: 'Active',
      slug: 'active',
      description: 'Listing aktif'
    });
    console.log('✅ Created ListingStatus: Active');
  } else {
    console.log('✅ ListingStatus "Active" already exists');
  }

  return { assetType, marketStatus, listingStatus };
}

async function getOrCreateAdmin() {
  let admin = await Admin.findOne({ email: 'admin@sproperty.com' });
  if (!admin) {
    admin = await Admin.create({
      name: 'System Migration',
      email: 'admin@sproperty.com',
      password: 'temporary', // This should be hashed in real scenario
      role: 'superadmin'  // Changed from 'admin' to 'superadmin'
    });
    console.log('✅ Created migration admin user');
  }
  return admin;
}

async function migrateClusters(propertyData, propertyId) {
  const clusters = [];
  
  if (propertyData.clusters && propertyData.clusters.length > 0) {
    for (const clusterName of propertyData.clusters) {
      // Handle different cluster formats
      let clustersList = [];
      
      if (typeof clusterName === 'string') {
        clustersList = [clusterName];
      } else if (typeof clusterName === 'object') {
        // Handle cases like { premium_cluster: [...], deluxe_cluster: [...] }
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
            console.log(`   ✅ Created cluster: ${name}`);
          }
          
          clusters.push(cluster._id);
        }
      }
    }
  }
  
  return clusters;
}

async function migrateProperties() {
  console.log('\n📦 Starting properties migration...');
  
  const { assetType, marketStatus, listingStatus } = await ensureCategories();
  const admin = await getOrCreateAdmin();
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const propertyData of residentialsData) {
    try {
      console.log(`\n🏠 Migrating: ${propertyData.name}`);
      
      // Check if property already exists
      const existingProperty = await Property.findOne({ id: propertyData.id });
      if (existingProperty) {
        console.log(`   ⚠️  Property ${propertyData.name} already exists, skipping...`);
        continue;
      }
      
      // Check Cloudinary configuration
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.warn('   ⚠️  Cloudinary not configured, using local image URLs');
      }
      
      // Process gallery images (upload to Cloudinary if configured)
      let gallery = [];
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        gallery = await processPropertyGallery(propertyData);
      } else {
        // Fallback to original format if Cloudinary not configured
        gallery = propertyData.gallery.map(img => ({
          src: img.src,
          alt: img.alt,
          type: 'property',
          publicId: null,
          isLocal: true
        }));
      }
      
      // Create property first (without clusters)
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
        clusters: [], // Will be updated after cluster creation
        createdBy: admin._id,
        updatedBy: admin._id
      });
      
      // Migrate clusters
      const clusterIds = await migrateClusters(propertyData, property._id);
      
      // Update property with cluster references
      if (clusterIds.length > 0) {
        await Property.findByIdAndUpdate(property._id, {
          clusters: clusterIds
        });
        console.log(`   ✅ Added ${clusterIds.length} clusters`);
      }
      
      console.log(`   ✅ Successfully migrated: ${propertyData.name}`);
      successCount++;
      
    } catch (error) {
      console.error(`   ❌ Error migrating ${propertyData.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Success: ${successCount} properties`);
  console.log(`❌ Errors: ${errorCount} properties`);
  console.log(`📝 Total: ${residentialsData.length} properties in source data`);
}

async function main() {
  console.log('🚀 Starting Residential Data Migration...');
  console.log(`📂 Found ${residentialsData.length} properties to migrate\n`);
  console.log('🔧 Environment check:');
  console.log(`  - MongoDB URI: ${process.env.MONGODB_URI ? '✅' : '❌'}`);
  console.log(`  - Cloudinary Cloud Name: ${CLOUDINARY_CLOUD_NAME ? '✅' : '❌'}`);
  console.log(`  - Cloudinary API Key: ${CLOUDINARY_API_KEY ? '✅' : '❌'}`);
  console.log(`  - Cloudinary API Secret: ${CLOUDINARY_API_SECRET ? '✅' : '❌'}\n`);
  
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully\n');
    
    console.log('🏗️  Starting migration process...');
    await migrateProperties();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('🔍 You can verify the data in your admin panel or database');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateProperties, ensureCategories };
