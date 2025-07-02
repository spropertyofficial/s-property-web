// scripts/migrateData.js (Final Version)

import "dotenv/config.js";
import mongoose from "mongoose";

// PERBAIKAN: Tambahkan ekstensi .js pada semua import lokal
import Residential from "../src/lib/models/Residential.js";
import Property from "../src/lib/models/Property.js";
import Admin from "../src/lib/models/Admin.js";
import CategoryAssetType from "../src/lib/models/CategoryAssetType.js";
import CategoryMarketStatus from "../src/lib/models/CategoryMarketStatus.js";
import CategoryListingStatus from "../src/lib/models/CategoryListingStatus.js";

const migrateData = async () => {
  // Seluruh isi fungsi ini tetap sama, tidak perlu diubah.
  try {
    console.log("Menghubungkan ke database...");

    await mongoose.connect(
      "mongodb+srv://spropertyofficial:spropertyofficial@s-property-cms.viikv.mongodb.net/sproperty?retryWrites=true&w=majority&appName=s-property-cms"
    );
    console.log("Berhasil terhubung ke database.");

    // ... (Sisa logika migrasi Anda tetap sama persis)
    console.log("Mengambil ID kategori default...");
    const defaultAssetType = await CategoryAssetType.findOne({
      name: "Perumahan",
    });
    const defaultMarketStatus = await CategoryMarketStatus.findOne({
      name: "Primary",
    });
    const saleStatus = await CategoryListingStatus.findOne({ name: "Dijual" });
    const defaultAdmin = await Admin.findOne({ role: "superadmin" });

    if (
      !defaultAssetType ||
      !defaultMarketStatus ||
      !saleStatus ||
      !defaultAdmin
    ) {
      console.error(
        'ERROR: Pastikan data default "Perumahan", "Primary", "Dijual", dan setidaknya satu "superadmin" sudah ada di database Anda.'
      );
      await mongoose.connection.close();
      return;
    }
    console.log("Berhasil mendapatkan ID default.");

    const oldResidentials = await Residential.find().lean();
    console.log(`Ditemukan ${oldResidentials.length} dokumen di koleksi lama.`);

    if (oldResidentials.length === 0) {
      console.log("Tidak ada data untuk dimigrasikan.");
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    for (const oldDoc of oldResidentials) {
      // Cek duplikat sebelum migrasi
      const existingProperty = await Property.findOne({ id: oldDoc.id });
      if (existingProperty) {
        console.log(
          `   -> Skipping, properti '${oldDoc.name}' sudah ada di koleksi baru.`
        );
        continue;
      }

      console.log(`Memigrasikan: ${oldDoc.name}...`);

      const newPropertyData = {
        id: oldDoc.id,
        name: oldDoc.name,
        startPrice: oldDoc.startPrice,
        developer: oldDoc.developer,
        clusters: oldDoc.clusters,
        location: oldDoc.location,
        gallery: oldDoc.gallery,
        description: oldDoc.description,
        assetType: defaultAssetType._id,
        marketStatus: defaultMarketStatus._id,
        listingStatus: saleStatus._id,
        createdBy: defaultAdmin._id,
        updatedBy: defaultAdmin._id,
        createdAt: oldDoc.createdAt,
        updatedAt: oldDoc.updatedAt,
      };

      const newProperty = new Property(newPropertyData);
      await newProperty.save();
      migratedCount++;
    }

    console.log(
      `\nMigrasi Selesai! Berhasil memigrasikan ${migratedCount} dokumen baru.`
    );
    console.log("Data Anda sekarang ada di koleksi 'properties'.");
  } catch (error) {
    console.error("\nTerjadi error saat migrasi:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Koneksi database ditutup.");
  }
};

migrateData();
