import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Property from '../src/lib/models/Property.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function reUploadImagesForFixedProperty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the property that was just fixed (damara-Village)
    const property = await Property.findOne({ id: 'damara-Village' });
    
    if (!property) {
      console.log('❌ Property with ID "damara-Village" not found');
      return;
    }
    
    console.log(`🔍 Found property: ${property.name}`);
    console.log(`📁 Property ID: ${property.id}`);
    
    // Check if the property has any existing images
    if (property.gallery && property.gallery.length > 0) {
      console.log(`⚠️  Property already has ${property.gallery.length} images. Skipping upload to avoid duplicates.`);
      console.log('   If you want to replace images, please clear the gallery first.');
      return;
    }
    
    // Find the images directory for this property
    const imagesDir = path.join(__dirname, '..', 'src', 'data', 'images', 'residentials', property.id);
    
    if (!fs.existsSync(imagesDir)) {
      // Try with the old whitespace ID
      const oldImagesDir = path.join(__dirname, '..', 'src', 'data', 'images', 'residentials', ' damara-Village ');
      if (fs.existsSync(oldImagesDir)) {
        console.log(`📁 Found images in old directory: ${oldImagesDir}`);
        console.log(`🔄 Renaming directory to match fixed ID...`);
        fs.renameSync(oldImagesDir, imagesDir);
        console.log(`✅ Directory renamed successfully`);
      } else {
        console.log(`❌ No images directory found for property: ${property.id}`);
        return;
      }
    }
    
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      console.log(`❌ No image files found in directory: ${imagesDir}`);
      return;
    }
    
    console.log(`📸 Found ${imageFiles.length} image files to upload`);
    
    const uploadedImages = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imagePath = path.join(imagesDir, imageFile);
      
      console.log(`\n📤 Uploading image ${i + 1}/${imageFiles.length}: ${imageFile}`);
      
      try {
        const result = await cloudinary.uploader.upload(imagePath, {
          folder: `s-property/residentials/${property.id}`,
          public_id: path.parse(imageFile).name,
          overwrite: true,
          resource_type: 'image'
        });
        
        uploadedImages.push({
          src: result.secure_url,
          alt: `${property.name} - Image ${i + 1}`,
          type: 'property',
          publicId: result.public_id
        });
        
        console.log(`   ✅ Uploaded successfully: ${result.secure_url}`);
        
      } catch (uploadError) {
        console.error(`   ❌ Failed to upload ${imageFile}:`, uploadError.message);
      }
    }
    
    // Update the property with uploaded images
    if (uploadedImages.length > 0) {
      console.log(`\n💾 Updating property with ${uploadedImages.length} uploaded images...`);
      
      await Property.updateOne(
        { _id: property._id },
        { $set: { gallery: uploadedImages } }
      );
      
      console.log(`✅ Property updated successfully with ${uploadedImages.length} images`);
    } else {
      console.log(`❌ No images were uploaded successfully`);
    }
    
    console.log('\n🎉 Re-upload process completed!');
    
  } catch (error) {
    console.error('❌ Error re-uploading images:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

reUploadImagesForFixedProperty();
