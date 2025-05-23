// src\lib\models\Residential.js
import mongoose from 'mongoose'

const ResidentialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startPrice: { type: Number, required: true },
  developer: { type: String, required: true },
  clusters: [{ type: String }],
  propertyStatus: { type: String, enum: ['SALE', 'RENT', 'SOLD'], default: 'SALE' },
  location: {
    region: String,
    city: String,
    area: String,
    address: String,
    country: String,
    mapsLink: String
  },
  gallery: [{
    src: String,
    alt: String
  }]
}, { timestamps: true })

// Cek apakah model sudah ada untuk mencegah error "Cannot overwrite model"
export default mongoose.models.Residential || mongoose.model('Residential', ResidentialSchema)
