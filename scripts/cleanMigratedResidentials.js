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
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import Property from '../src/lib/models/Property.js';
import Cluster from '../src/lib/models/Cluster.js';

// Import data residentials untuk mendapatkan ID yang akan dihapus
import { residentialsData } from '../src/data/residentials.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function askConfirmation(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function cleanMigratedData() {
  // Extract IDs dari residentialsData
  const residentialIds = residentialsData.map(item => item.id);
  
  console.log('🧹 This will delete ONLY migrated residential properties:');
  console.log('📋 Properties to be deleted:');
  residentialsData.forEach((property, index) => {
    console.log(`   ${index + 1}. ${property.name} (ID: ${property.id})`);
  });
  console.log(`\n📊 Total: ${residentialIds.length} properties`);
  console.log('\n⚠️  This action cannot be undone.\n');
  
  const confirmed = await askConfirmation('Are you sure you want to delete these migrated properties? (yes/no): ');
  
  if (!confirmed) {
    console.log('❌ Operation cancelled.');
    return;
  }
  
  try {
    // Get properties that will be deleted to find their clusters
    const propertiesToDelete = await Property.find({ 
      id: { $in: residentialIds } 
    }).populate('clusters');
    
    console.log(`\n🔍 Found ${propertiesToDelete.length} properties to delete`);
    
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
    rl.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanMigratedData };
