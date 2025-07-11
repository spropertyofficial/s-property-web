#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

// Import models
import CategoryMarketStatus from '../src/lib/models/CategoryMarketStatus.js';
import CategoryListingStatus from '../src/lib/models/CategoryListingStatus.js';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function checkCategories() {
  console.log('🔍 Current MarketStatus categories:');
  const marketStatuses = await CategoryMarketStatus.find({});
  marketStatuses.forEach((status, index) => {
    console.log(`   ${index + 1}. ${status.name} (${status.slug})`);
  });

  console.log('\n🔍 Current ListingStatus categories:');
  const listingStatuses = await CategoryListingStatus.find({});
  listingStatuses.forEach((status, index) => {
    console.log(`   ${index + 1}. ${status.name} (${status.slug})`);
  });
}

async function ensureRequiredCategories() {
  console.log('\n🛠️  Ensuring required categories exist...');
  
  // Ensure MarketStatus "Primary" exists
  let primaryMarketStatus = await CategoryMarketStatus.findOne({ name: 'Primary' });
  if (!primaryMarketStatus) {
    primaryMarketStatus = await CategoryMarketStatus.create({
      name: 'Primary',
      slug: 'primary',
      description: 'Pasar primer properti'
    });
    console.log('✅ Created MarketStatus: Primary');
  } else {
    console.log('✅ MarketStatus "Primary" already exists');
  }

  // Ensure ListingStatus "Dijual" exists
  let dijualListingStatus = await CategoryListingStatus.findOne({ name: 'Dijual' });
  if (!dijualListingStatus) {
    dijualListingStatus = await CategoryListingStatus.create({
      name: 'Dijual',
      slug: 'dijual',
      description: 'Properti tersedia untuk dijual'
    });
    console.log('✅ Created ListingStatus: Dijual');
  } else {
    console.log('✅ ListingStatus "Dijual" already exists');
  }

  return { primaryMarketStatus, dijualListingStatus };
}

async function main() {
  try {
    await connectDB();
    await checkCategories();
    await ensureRequiredCategories();
    
    console.log('\n🎉 Category check completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

main();
