console.log("🚀 Server starting...");
// Vercel Serverless Function - Main API Entry Point
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../config/database');
const Inventory = require('../models/Inventory');
const Bill = require('../models/Bill');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
// Note: On Vercel, static files are also handled by explicit routes below
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// HEALTH CHECK & TEST ROUTES
// ============================================

// Health check endpoint (useful for debugging)
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      platform: 'Render'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      platform: 'Render',
      error: error.message
    });
  }
});

// ============================================
// INVENTORY ROUTES
// ============================================

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  await connectDB();
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    console.log('Inventory items found:', inventory.length);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get inventory items by category
app.get('/api/inventory/:category', async (req, res) => {
  await connectDB();
  try {
    const category = req.params.category.toLowerCase();
    const inventory = await Inventory.find({ category }).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single inventory item
app.get('/api/inventory/item/:id', async (req, res) => {
  await connectDB();
  try {
    const item = await Inventory.findOne({ id: req.params.id });
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new inventory item
app.post('/api/inventory', async (req, res) => {
  await connectDB();
  try {
    const newItem = new Inventory({
      id: uuidv4(),
      name: req.body.name,
      category: req.body.category,
      price: parseFloat(req.body.price),
      quantity: parseInt(req.body.quantity),
      description: req.body.description || '',
      sku: req.body.sku || '',
      image: req.body.image || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newItem.save();
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  await connectDB();
  try {
    const item = await Inventory.findOneAndUpdate(
      { id: req.params.id },
      {
        ...req.body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', async (req, res) => {
  await connectDB();
  try {
    const item = await Inventory.findOneAndDelete({ id: req.params.id });
    if (item) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize sample inventory
app.post('/api/inventory/initialize', async (req, res) => {
  await connectDB();
  try {
    const existingCount = await Inventory.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Inventory already initialized', count: existingCount });
    }

    const sampleItems = [
      // Fancy Items (50 items)
      { id: uuidv4(), name: 'Handmade Bracelet Set', category: 'fancy', price: 299.00, quantity: 50, description: 'Beautiful handmade bracelet set', sku: 'FANCY-001', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Wall Clock', category: 'fancy', price: 899.00, quantity: 30, description: 'Vintage style decorative wall clock', sku: 'FANCY-002', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Vase Set', category: 'fancy', price: 1299.00, quantity: 25, description: 'Elegant crystal vase set', sku: 'FANCY-003', image: 'https://images.unsplash.com/photo-1578932750355-5eb30ece6a6e?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ceramic Dinner Set', category: 'fancy', price: 2499.00, quantity: 20, description: 'Complete ceramic dinner set for 6', sku: 'FANCY-004', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Wall Art Painting', category: 'fancy', price: 1899.00, quantity: 15, description: 'Beautiful landscape wall art painting', sku: 'FANCY-005', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Candle Set', category: 'fancy', price: 599.00, quantity: 40, description: 'Aromatic decorative candle set', sku: 'FANCY-006', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Jewelry Box', category: 'fancy', price: 799.00, quantity: 35, description: 'Wooden handmade jewelry box', sku: 'FANCY-007', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Chandelier', category: 'fancy', price: 4999.00, quantity: 10, description: 'Elegant crystal chandelier', sku: 'FANCY-008', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Mirror', category: 'fancy', price: 1599.00, quantity: 25, description: 'Antique style decorative mirror', sku: 'FANCY-009', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Silk Cushion Covers', category: 'fancy', price: 399.00, quantity: 60, description: 'Premium silk cushion covers set', sku: 'FANCY-010', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Lamp Stand', category: 'fancy', price: 1199.00, quantity: 20, description: 'Traditional brass lamp stand', sku: 'FANCY-011', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Pottery Set', category: 'fancy', price: 899.00, quantity: 30, description: 'Artisan handmade pottery set', sku: 'FANCY-012', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Wind Chimes', category: 'fancy', price: 499.00, quantity: 45, description: 'Melodious decorative wind chimes', sku: 'FANCY-013', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Glass Set', category: 'fancy', price: 1799.00, quantity: 18, description: 'Premium crystal glass drinking set', sku: 'FANCY-014', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Wall Shelf Unit', category: 'fancy', price: 2299.00, quantity: 12, description: 'Modern wall shelf unit', sku: 'FANCY-015', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Bowl Set', category: 'fancy', price: 699.00, quantity: 40, description: 'Ceramic decorative bowl set', sku: 'FANCY-016', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handcrafted Wooden Box', category: 'fancy', price: 599.00, quantity: 50, description: 'Handcrafted wooden storage box', sku: 'FANCY-017', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Lantern', category: 'fancy', price: 799.00, quantity: 35, description: 'Traditional decorative lantern', sku: 'FANCY-018', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Photo Frame', category: 'fancy', price: 399.00, quantity: 55, description: 'Elegant crystal photo frame', sku: 'FANCY-019', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Wall Hanging', category: 'fancy', price: 999.00, quantity: 28, description: 'Beautiful decorative wall hanging', sku: 'FANCY-020', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Candle Holder', category: 'fancy', price: 449.00, quantity: 48, description: 'Traditional brass candle holder', sku: 'FANCY-021', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Basket Set', category: 'fancy', price: 349.00, quantity: 60, description: 'Handwoven basket set', sku: 'FANCY-022', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Plate Set', category: 'fancy', price: 899.00, quantity: 32, description: 'Decorative ceramic plate set', sku: 'FANCY-023', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Jewelry Box', category: 'fancy', price: 1299.00, quantity: 22, description: 'Crystal jewelry storage box', sku: 'FANCY-024', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Wall Clock Set', category: 'fancy', price: 1499.00, quantity: 16, description: 'Matching wall clock set', sku: 'FANCY-025', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Vase', category: 'fancy', price: 699.00, quantity: 38, description: 'Single decorative vase', sku: 'FANCY-026', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handcrafted Lamp', category: 'fancy', price: 1899.00, quantity: 14, description: 'Handcrafted decorative lamp', sku: 'FANCY-027', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ceramic Mug Set', category: 'fancy', price: 499.00, quantity: 45, description: 'Decorative ceramic mug set', sku: 'FANCY-028', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Bowl Set', category: 'fancy', price: 799.00, quantity: 30, description: 'Traditional brass bowl set', sku: 'FANCY-029', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Pillow Set', category: 'fancy', price: 599.00, quantity: 42, description: 'Decorative pillow covers set', sku: 'FANCY-030', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Candle Holder', category: 'fancy', price: 649.00, quantity: 36, description: 'Crystal candle holder set', sku: 'FANCY-031', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Coaster Set', category: 'fancy', price: 299.00, quantity: 55, description: 'Handcrafted coaster set', sku: 'FANCY-032', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Tray', category: 'fancy', price: 449.00, quantity: 48, description: 'Wooden decorative tray', sku: 'FANCY-033', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Photo Frame', category: 'fancy', price: 399.00, quantity: 50, description: 'Brass decorative photo frame', sku: 'FANCY-034', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ceramic Vase', category: 'fancy', price: 799.00, quantity: 28, description: 'Handmade ceramic vase', sku: 'FANCY-035', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Clock', category: 'fancy', price: 999.00, quantity: 24, description: 'Antique style decorative clock', sku: 'FANCY-036', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Glass Set', category: 'fancy', price: 1199.00, quantity: 20, description: 'Crystal drinking glass set', sku: 'FANCY-037', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handcrafted Box', category: 'fancy', price: 549.00, quantity: 40, description: 'Handcrafted wooden box', sku: 'FANCY-038', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Lantern Set', category: 'fancy', price: 899.00, quantity: 30, description: 'Decorative lantern set', sku: 'FANCY-039', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Candle Stand', category: 'fancy', price: 649.00, quantity: 35, description: 'Brass candle stand', sku: 'FANCY-040', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ceramic Bowl', category: 'fancy', price: 349.00, quantity: 52, description: 'Decorative ceramic bowl', sku: 'FANCY-041', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Jewelry Set', category: 'fancy', price: 1499.00, quantity: 18, description: 'Complete handmade jewelry set', sku: 'FANCY-042', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Mirror Frame', category: 'fancy', price: 799.00, quantity: 32, description: 'Decorative mirror frame', sku: 'FANCY-043', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Vase Single', category: 'fancy', price: 599.00, quantity: 40, description: 'Single crystal vase', sku: 'FANCY-044', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handcrafted Lamp Shade', category: 'fancy', price: 449.00, quantity: 45, description: 'Handcrafted lamp shade', sku: 'FANCY-045', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Wall Art', category: 'fancy', price: 1299.00, quantity: 22, description: 'Modern decorative wall art', sku: 'FANCY-046', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Brass Bowl', category: 'fancy', price: 399.00, quantity: 48, description: 'Single brass bowl', sku: 'FANCY-047', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Ceramic Plate Set', category: 'fancy', price: 699.00, quantity: 38, description: 'Ceramic decorative plate set', sku: 'FANCY-048', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Handmade Basket', category: 'fancy', price: 249.00, quantity: 60, description: 'Single handmade basket', sku: 'FANCY-049', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Candle Holder', category: 'fancy', price: 349.00, quantity: 50, description: 'Single decorative candle holder', sku: 'FANCY-050', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },

      // Electronics (50 items)
      { id: uuidv4(), name: 'Wireless Bluetooth Headphones', category: 'electronics', price: 2499.00, quantity: 40, description: 'Premium wireless Bluetooth headphones', sku: 'ELEC-001', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Smart LED TV 32 inch', category: 'electronics', price: 15999.00, quantity: 15, description: '32 inch Smart LED TV', sku: 'ELEC-002', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Bluetooth Speaker', category: 'electronics', price: 1299.00, quantity: 35, description: 'Portable Bluetooth speaker', sku: 'ELEC-003', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Wireless Mouse', category: 'electronics', price: 599.00, quantity: 60, description: 'Optical wireless mouse', sku: 'ELEC-004', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'USB Keyboard', category: 'electronics', price: 899.00, quantity: 45, description: 'Mechanical USB keyboard', sku: 'ELEC-005', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Power Bank 10000mAh', category: 'electronics', price: 1499.00, quantity: 30, description: 'Fast charging power bank', sku: 'ELEC-006', image: 'https://images.unsplash.com/photo-1609594040201-17afa1b2c6b8?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'HDMI Cable 2m', category: 'electronics', price: 299.00, quantity: 80, description: 'High speed HDMI cable', sku: 'ELEC-007', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'USB Extension Cable', category: 'electronics', price: 149.00, quantity: 100, description: 'USB extension cable 3m', sku: 'ELEC-008', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Phone Charger', category: 'electronics', price: 399.00, quantity: 70, description: 'Fast phone charger', sku: 'ELEC-009', image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Memory Card 32GB', category: 'electronics', price: 699.00, quantity: 50, description: 'Class 10 memory card', sku: 'ELEC-010', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Electrical Wire (1mm)', category: 'electronics', price: 49.00, quantity: 500, description: 'Copper electrical wire 1mm', sku: 'ELEC-011', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'PVC Electrical Pipe 20mm', category: 'electronics', price: 89.00, quantity: 300, description: 'PVC electrical conduit pipe 20mm', sku: 'ELEC-012', image: 'https://images.unsplash.com/photo-1612961514403-7ea0b3c7a0f7?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'LED Tubelight 20W', category: 'electronics', price: 449.00, quantity: 100, description: 'Energy efficient LED tubelight 20W', sku: 'ELEC-013', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Screws Set (Assorted)', category: 'electronics', price: 149.00, quantity: 200, description: 'Assorted electrical screws set', sku: 'ELEC-014', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Switch Board', category: 'electronics', price: 299.00, quantity: 150, description: 'Electrical switch board', sku: 'ELEC-015', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Extension Cord 5m', category: 'electronics', price: 199.00, quantity: 120, description: 'Heavy duty extension cord', sku: 'ELEC-016', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'LED Bulb 9W', category: 'electronics', price: 89.00, quantity: 200, description: 'Energy saving LED bulb', sku: 'ELEC-017', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Fan Regulator', category: 'electronics', price: 249.00, quantity: 80, description: 'Electronic fan speed regulator', sku: 'ELEC-018', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Doorbell', category: 'electronics', price: 399.00, quantity: 60, description: 'Wireless doorbell', sku: 'ELEC-019', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Cable Ties Pack', category: 'electronics', price: 49.00, quantity: 300, description: 'Plastic cable ties pack', sku: 'ELEC-020', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Electrical Tape', category: 'electronics', price: 29.00, quantity: 400, description: 'Insulating electrical tape', sku: 'ELEC-021', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Wire Stripper', category: 'electronics', price: 149.00, quantity: 90, description: 'Professional wire stripper tool', sku: 'ELEC-022', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Multimeter', category: 'electronics', price: 799.00, quantity: 40, description: 'Digital multimeter', sku: 'ELEC-023', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },

// ============================================
// BILL ROUTES
// ============================================

// Create new bill
app.post('/api/bills', async (req, res) => {
  await connectDB();
  try {
    const inventoryItems = await Inventory.find();
    
    const billItems = req.body.items.map(item => {
      const invItem = inventoryItems.find(i => i.id === item.id);
      return {
        id: item.id,
        name: invItem ? invItem.name : item.name,
        price: invItem ? invItem.price : item.price,
        quantity: item.quantity
      };
    });

    const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newBill = new Bill({
      id: uuidv4(),
      billNumber: `BILL-${Date.now()}`,
      items: billItems,
      total: total,
      customerName: req.body.customerName || '',
      customerPhone: req.body.customerPhone || '',
      paymentMethod: req.body.paymentMethod || 'cash',
      createdAt: new Date()
    });

    await newBill.save();

    // Update inventory quantities
    for (const billItem of billItems) {
      const invItem = await Inventory.findOne({ id: billItem.id });
      if (invItem && invItem.quantity >= billItem.quantity) {
        invItem.quantity -= billItem.quantity;
        invItem.updatedAt = new Date();
        await invItem.save();
      }
    }

    res.json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bills
app.get('/api/bills', async (req, res) => {
  await connectDB();
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bill
app.get('/api/bills/:id', async (req, res) => {
  await connectDB();
  try {
    const bill = await Bill.findOne({ id: req.params.id });
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ error: 'Bill not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SALES REPORTS ROUTES
// ============================================

// Daily sales report
app.get('/api/reports/daily', async (req, res) => {
  await connectDB();
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dailyBills = await Bill.find({
      createdAt: { $gte: date, $lt: nextDate }
    }).sort({ createdAt: -1 });

    const report = await generateReport(dailyBills, 'daily', date);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monthly sales report
app.get('/api/reports/monthly', async (req, res) => {
  await connectDB();
  try {
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const monthlyBills = await Bill.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const report = await generateReport(monthlyBills, 'monthly', startDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yearly sales report
app.get('/api/reports/yearly', async (req, res) => {
  await connectDB();
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const yearlyBills = await Bill.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    const report = await generateReport(yearlyBills, 'yearly', startDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate report data
async function generateReport(bills, period, date) {
  try {
    const totalBills = bills.length;
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    
    const categoryStats = {};
    const inventoryItems = await Inventory.find();

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const invItem = inventoryItems.find(i => i.id === item.id);
        const category = invItem ? invItem.category : 'unknown';
        
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, revenue: 0, quantity: 0 };
        }
        categoryStats[category].count += 1;
        categoryStats[category].revenue += item.price * item.quantity;
        categoryStats[category].quantity += item.quantity;
      });
    });

    const dailyBreakdown = {};
    if (period === 'monthly' || period === 'yearly') {
      bills.forEach(bill => {
        const billDate = new Date(bill.createdAt).toISOString().split('T')[0];
        if (!dailyBreakdown[billDate]) {
          dailyBreakdown[billDate] = { bills: 0, revenue: 0 };
        }
        dailyBreakdown[billDate].bills += 1;
        dailyBreakdown[billDate].revenue += bill.total;
      });
    }

    return {
      period,
      date: date.toISOString().split('T')[0],
      totalBills,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      categoryStats,
      dailyBreakdown,
      bills: bills.map(b => ({
        id: b.id,
        billNumber: b.billNumber,
        total: b.total,
        createdAt: b.createdAt
      }))
    };
  } catch (error) {
    throw error;
  }
}

// Download report as CSV
app.get('/api/reports/download/:type', async (req, res) => {
  await connectDB();
  try {
    const type = req.params.type;
    let bills = [];
    let filename = '';
    
    if (type === 'daily') {
      const date = req.query.date ? new Date(req.query.date) : new Date();
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      bills = await Bill.find({
        createdAt: { $gte: date, $lt: nextDate }
      }).sort({ createdAt: -1 });
      filename = `sales_report_daily_${date.toISOString().split('T')[0]}.csv`;
    } else if (type === 'monthly') {
      const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      bills = await Bill.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: -1 });
      filename = `sales_report_monthly_${year}_${month}.csv`;
    } else if (type === 'yearly') {
      const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      bills = await Bill.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: -1 });
      filename = `sales_report_yearly_${year}.csv`;
    }
    
    // Generate CSV
    let csv = 'Bill Number,Date,Customer Name,Phone,Items,Quantity,Total Amount,Payment Method\n';
    bills.forEach(bill => {
      const date = new Date(bill.createdAt).toLocaleString();
      const itemsList = bill.items.map(i => i.name).join('; ');
      const quantity = bill.items.reduce((sum, i) => sum + i.quantity, 0);
      const paymentMethod = bill.paymentMethod || 'cash';
      csv += `"${bill.billNumber}","${date}","${bill.customerName || ''}","${bill.customerPhone || ''}","${itemsList}",${quantity},${bill.total.toFixed(2)},"${paymentMethod}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SERVE STATIC FILES AND FRONTEND
// ============================================

// Serve main page - MUST be after API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Serve static assets (CSS, JS) - Explicit routes
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/styles.css'));
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/script.js'));
});

// Handle all other non-API routes - serve index.html for SPA
// IMPORTANT: This must be last, after all API routes
app.get('*', (req, res) => {
  // Don't catch API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Export the Express app for Render deployment
module.exports = app;

// Run locally only (not on Render)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on port ${PORT}`);
  });
}
