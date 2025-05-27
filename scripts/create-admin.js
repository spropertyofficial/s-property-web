// Run: node scripts/create-admin.js
import bcrypt from "bcryptjs";
import connectDB from "../src/lib/mongodb.js";
import Admin from "../src/lib/models/Admin.js";

async function createAdmin() {
  await connectDB();

  const adminData = {
    email: "admin@sproperty.co.id",
    password: await bcrypt.hash("sproperty2024", 12),
    role: "admin",
    name: "Super Admin",
  };

  try {
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const admin = await Admin.create(adminData);
    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

createAdmin();
