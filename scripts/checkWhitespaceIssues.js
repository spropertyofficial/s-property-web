#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '..', '.env.local') });

import Property from '../src/lib/models/Property.js';

async function checkWhitespaceIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const properties = await Property.find({}).select('id name');
    
    console.log('\n🔍 Checking for properties with whitespace issues in ID:');
    const whitespaceIssues = [];
    
    properties.forEach(property => {
      if (property.id && (property.id.trim() !== property.id || property.id.includes('  '))) {
        whitespaceIssues.push({
          id: property.id,
          name: property.name,
          trimmed: property.id.trim(),
          hasLeadingSpace: property.id.startsWith(' '),
          hasTrailingSpace: property.id.endsWith(' '),
          hasDoubleSpaces: property.id.includes('  ')
        });
      }
    });
    
    if (whitespaceIssues.length > 0) {
      console.log('❌ Found properties with whitespace issues:');
      whitespaceIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ID: "${issue.id}" | Name: ${issue.name}`);
        console.log(`   - Leading space: ${issue.hasLeadingSpace}`);
        console.log(`   - Trailing space: ${issue.hasTrailingSpace}`);
        console.log(`   - Double spaces: ${issue.hasDoubleSpaces}`);
        console.log(`   - Suggested fix: "${issue.trimmed.replace(/\s+/g, '-')}"`);
        console.log('');
      });
    } else {
      console.log('✅ No properties found with whitespace issues in ID.');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkWhitespaceIssues();
