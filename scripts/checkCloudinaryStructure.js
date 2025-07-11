import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkCloudinaryStructure() {
  try {
    console.log('🔍 Checking Cloudinary folder structure...');
    
    // Get all resources to find damara-village images
    console.log('\n📋 Getting recent uploads...');
    
    const allResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });

    console.log(`Found ${allResources.resources.length} total images`);
    
    // Filter for damara-village images
    const damaraImages = allResources.resources.filter(resource => 
      resource.public_id.toLowerCase().includes('damara')
    );

    console.log(`\n🎯 Found ${damaraImages.length} damara-related images:`);
    
    damaraImages.forEach((resource, index) => {
      console.log(`\n${index + 1}. ${resource.public_id}`);
      console.log(`   URL: ${resource.secure_url}`);
      console.log(`   Created: ${resource.created_at}`);
      console.log(`   Folder: ${resource.folder || 'ROOT'}`);
      console.log(`   Size: ${resource.bytes} bytes`);
    });

    // Also check s-property folder structure
    console.log('\n\n📁 Analyzing folder structure...');
    
    const folderStructure = {};
    allResources.resources.forEach((resource) => {
      const pathParts = resource.public_id.split('/');
      if (pathParts.length > 1) {
        const folderPath = pathParts.slice(0, -1).join('/');
        if (!folderStructure[folderPath]) {
          folderStructure[folderPath] = 0;
        }
        folderStructure[folderPath]++;
      } else {
        if (!folderStructure['ROOT']) {
          folderStructure['ROOT'] = 0;
        }
        folderStructure['ROOT']++;
      }
    });

    console.log('\n📊 Folder Structure Summary:');
    Object.entries(folderStructure)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([folder, count]) => {
        console.log(`  ${folder}: ${count} images`);
      });

  } catch (error) {
    console.error('❌ Error checking Cloudinary structure:', error);
  }
}

checkCloudinaryStructure().catch(console.error);
