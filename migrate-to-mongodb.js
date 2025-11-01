// Migration script to move data from JSON files to MongoDB
// Run this ONCE after setting up MongoDB Atlas

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Bill = require('./models/Bill');

const INVENTORY_FILE = path.join(__dirname, 'data', 'inventory.json');
const BILLS_FILE = path.join(__dirname, 'data', 'bills.json');

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingInventory = await Inventory.countDocuments();
    const existingBills = await Bill.countDocuments();

    if (existingInventory > 0 || existingBills > 0) {
      console.log('⚠️  Database already has data!');
      console.log(`   Inventory items: ${existingInventory}`);
      console.log(`   Bills: ${existingBills}`);
      console.log('   Skipping migration to prevent duplicates.');
      console.log('   If you want to migrate anyway, delete existing data first.');
      process.exit(0);
    }

    // Migrate Inventory
    if (fs.existsSync(INVENTORY_FILE)) {
      const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
      if (inventoryData.length > 0) {
        console.log(`📦 Migrating ${inventoryData.length} inventory items...`);
        // Convert to MongoDB format
        const inventoryDocs = inventoryData.map(item => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
        }));
        await Inventory.insertMany(inventoryDocs);
        console.log(`✅ Migrated ${inventoryData.length} inventory items`);
      } else {
        console.log('ℹ️  No inventory items to migrate');
      }
    } else {
      console.log('ℹ️  No inventory.json file found');
    }

    // Migrate Bills
    if (fs.existsSync(BILLS_FILE)) {
      const billsData = JSON.parse(fs.readFileSync(BILLS_FILE, 'utf8'));
      if (billsData.length > 0) {
        console.log(`🧾 Migrating ${billsData.length} bills...`);
        // Convert to MongoDB format
        const billsDocs = billsData.map(bill => ({
          ...bill,
          createdAt: bill.createdAt ? new Date(bill.createdAt) : new Date()
        }));
        await Bill.insertMany(billsDocs);
        console.log(`✅ Migrated ${billsData.length} bills`);
      } else {
        console.log('ℹ️  No bills to migrate');
      }
    } else {
      console.log('ℹ️  No bills.json file found');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 You can now use server.js (MongoDB version) instead of server.local.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();

