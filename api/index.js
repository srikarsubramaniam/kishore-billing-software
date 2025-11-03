console.log("🚀 Server starting...");
// Render Web Service - Main API Entry Point
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../config/database');
const Inventory = require('../models/Inventory');
const Bill = require('../models/Bill');

const app = express();
// ✅ Enable CORS for frontend + local dev

const allowed = [
  'https://kishore-billing-software.onrender.com', // your deployed frontend
  'http://localhost:10000' // local testing (optional)
];

app.use(cors({
  origin: (origin, cb) => cb(null, allowed.includes(origin) || !origin),
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Optional preflight
app.options('*', cors());


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
    console.log('🏥 Health check initiated...');
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';

    console.log('🔍 Testing database query...');
    // Test database with a simple query
    const inventoryCount = await Inventory.countDocuments();
    console.log(`📊 Inventory count: ${inventoryCount}`);

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      platform: 'Render',
      connectionState: dbState,
      inventoryCount: inventoryCount,
      message: `Found ${inventoryCount} inventory items`,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      platform: 'Render',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============================================
// INVENTORY ROUTES
// ============================================

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected, fetching inventory...');

    const inventory = await Inventory.find().sort({ createdAt: -1 });
    console.log('📦 Inventory query result:', {
      count: inventory.length,
      sample: inventory.slice(0, 2).map(item => ({ id: item.id, name: item.name, category: item.category }))
    });

    // Ensure we return the data even if empty
    res.setHeader('Content-Type', 'application/json');
    res.json(inventory || []);
  } catch (error) {
    console.error('❌ Error fetching inventory:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      error: error.message,
      message: 'Failed to fetch inventory data',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get inventory items by category
app.get('/api/inventory/:category', async (req, res) => {
  try {
    await connectDB();
    const category = req.params.category.toLowerCase();
    const inventory = await Inventory.find({ category }).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single inventory item
app.get('/api/inventory/item/:id', async (req, res) => {
  try {
    await connectDB();
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
  try {
    console.log('📝 Adding new inventory item:', req.body);
    await connectDB();
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

    console.log('💾 Saving item to database...');
    await newItem.save();
    console.log('✅ Item saved successfully:', newItem.id);
    res.json(newItem);
  } catch (error) {
    console.error('❌ Error saving inventory item:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update inventory item
app.put('/api/inventory/:id', async (req, res) => {
  try {
    await connectDB();
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
  try {
    await connectDB();
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



// ============================================
// BILL ROUTES
// ============================================

// Create new bill
app.post('/api/bills', async (req, res) => {
  try {
    await connectDB();
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
  try {
    await connectDB();
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bill
app.get('/api/bills/:id', async (req, res) => {
  try {
    await connectDB();
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
  try {
    await connectDB();
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
  try {
    await connectDB();
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
  try {
    await connectDB();
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
  try {
    await connectDB();
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
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log(`✅ Server running locally on port ${PORT}`);
  });
}
