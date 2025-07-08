import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Property from '../src/lib/models/Property.js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function fixWhitespaceIDs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find properties with whitespace issues
    const properties = await Property.find({}).select('id name');
    
    const whitespaceIssues = properties.filter(property => {
      return property.id && (property.id.trim() !== property.id || property.id.includes('  '));
    });
    
    if (whitespaceIssues.length === 0) {
      console.log('✅ No properties with whitespace issues found');
      return;
    }
    
    console.log(`🔍 Found ${whitespaceIssues.length} properties with whitespace issues:`);
    
    for (const property of whitespaceIssues) {
      const originalId = property.id;
      const fixedId = originalId.trim().replace(/\s+/g, '-');
      
      console.log(`\n📝 Fixing property: ${property.name}`);
      console.log(`   Original ID: "${originalId}"`);
      console.log(`   Fixed ID: "${fixedId}"`);
      
      // Check if the fixed ID already exists
      const existingProperty = await Property.findOne({
        id: fixedId,
        _id: { $ne: property._id }
      });
      
      if (existingProperty) {
        console.log(`   ⚠️  WARNING: Fixed ID "${fixedId}" already exists for another property!`);
        console.log(`   Skipping this property to avoid conflicts.`);
        continue;
      }
      
      // Update the property ID
      const result = await Property.updateOne(
        { _id: property._id },
        { $set: { id: fixedId } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Successfully updated property ID`);
      } else {
        console.log(`   ❌ Failed to update property ID`);
      }
    }
    
    console.log('\n🎉 Whitespace ID fixing process completed!');
    
  } catch (error) {
    console.error('❌ Error fixing whitespace IDs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixWhitespaceIDs();

fixWhitespaceIDs();
