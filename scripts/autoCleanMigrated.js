#!/usr/bin/env node

/**
 * Script untuk membersihkan HANYA data residential yang baru dimigrasi
 * Script ini hanya menghapus properties berdasarkan ID yang ada di residentialsData
 * Usage: node scripts/cleanMigratedResidentials.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import Property from '../src/lib/models/Property.js';
import Cluster from '../src/lib/models/Cluster.js';

// Import data residentials untuk mendapatkan ID yang akan dihapus
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

async function cleanMigratedData() {
  // Extract IDs dari residentialsData
  const residentialIds = residentialsData.map(item => item.id);
  
  console.log('🧹 Cleaning ONLY migrated residential properties:');
  console.log(`📊 Total properties to check: ${residentialIds.length}`);
  
  try {
    // Get properties that will be deleted to find their clusters
    const propertiesToDelete = await Property.find({ 
      id: { $in: residentialIds } 
    }).populate('clusters');
    
    console.log(`\n🔍 Found ${propertiesToDelete.length} migrated properties in database`);
    
    if (propertiesToDelete.length === 0) {
      console.log('✅ No migrated properties found to delete.');
      return;
    }
    
    // Show which properties will be deleted
    console.log('\n📋 Properties to be deleted:');
    propertiesToDelete.forEach((property, index) => {
      console.log(`   ${index + 1}. ${property.name} (ID: ${property.id})`);
    });
    
    // Collect cluster IDs from these properties
    const clusterIds = [];
    propertiesToDelete.forEach(property => {
      if (property.clusters && property.clusters.length > 0) {
        property.clusters.forEach(cluster => {
          clusterIds.push(cluster._id);
        });
      }
    });
    
    console.log('\n🗑️  Deleting clusters associated with migrated properties...');
    const clusterResult = await Cluster.deleteMany({
      _id: { $in: clusterIds }
    });
    console.log(`✅ Deleted ${clusterResult.deletedCount} clusters`);
    
    console.log('\n🗑️  Deleting migrated properties...');
    const propertyResult = await Property.deleteMany({
      id: { $in: residentialIds }
    });
    console.log(`✅ Deleted ${propertyResult.deletedCount} properties`);
    
    console.log('\n🎉 Migrated data cleaning completed!');
    console.log('💡 Other properties in database remain untouched.');
    
  } catch (error) {
    console.error('\n💥 Error during cleaning:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await cleanMigratedData();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

main();
