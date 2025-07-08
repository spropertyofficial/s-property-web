#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

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
      password: 'temporary',
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
      
      // Simple gallery without Cloudinary upload
      const gallery = propertyData.gallery.map((img, index) => ({
        src: img.src,
        alt: img.alt,
        type: 'property',
        publicId: `legacy/${propertyData.id}/${index + 1}`, // Generate legacy publicId
        isLocal: true
      }));
      
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
        clusters: [],
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
  console.log('🚀 Starting Simple Residential Data Migration...');
  console.log(`📂 Found ${residentialsData.length} properties to migrate\n`);
  
  try {
    await connectDB();
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

main();
