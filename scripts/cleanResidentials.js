#!/usr/bin/env node

/**
 * Script untuk membersihkan data properties yang telah dimigrasikan
 * HATI-HATI: Script ini akan menghapus SEMUA data properties!
 * Usage: node scripts/cleanResidentials.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const mongoose = require('mongoose');
const readline = require('readline');

// Import models
const Property = require('../src/lib/models/Property');
const Cluster = require('../src/lib/models/Cluster');

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

async function cleanData() {
  console.log('⚠️  WARNING: This will delete ALL properties and clusters!');
  console.log('This action cannot be undone.\n');
  
  const confirmed = await askConfirmation('Are you sure you want to continue? (yes/no): ');
  
  if (!confirmed) {
    console.log('❌ Operation cancelled.');
    return;
  }
  
  const doubleConfirm = await askConfirmation('Type "yes" again to confirm deletion: ');
  
  if (!doubleConfirm) {
    console.log('❌ Operation cancelled.');
    return;
  }
  
  try {
    console.log('\n🗑️  Deleting clusters...');
    const clusterResult = await Cluster.deleteMany({});
    console.log(`✅ Deleted ${clusterResult.deletedCount} clusters`);
    
    console.log('\n🗑️  Deleting properties...');
    const propertyResult = await Property.deleteMany({});
    console.log(`✅ Deleted ${propertyResult.deletedCount} properties`);
    
    console.log('\n🎉 Data cleaning completed!');
    
  } catch (error) {
    console.error('\n💥 Error during cleaning:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await cleanData();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanData };
