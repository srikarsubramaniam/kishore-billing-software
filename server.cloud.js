require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/database');
const Inventory = require('./models/Inventory');
const Bill = require('./models/Bill');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Get all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inventory items by category
app.get('/api/inventory/:category', async (req, res) => {
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

// Create new bill
app.post('/api/bills', async (req, res) => {
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
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single bill
app.get('/api/bills/:id', async (req, res) => {
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

// Initialize sample inventory
app.post('/api/inventory/initialize', async (req, res) => {
  try {
    const existingCount = await Inventory.countDocuments();
    if (existingCount > 0) {
      return res.json({ message: 'Inventory already initialized', count: existingCount });
    }

    const sampleItems = [
      // Fancy Items
      { id: uuidv4(), name: 'Handmade Bracelet Set', category: 'fancy', price: 299.00, quantity: 50, description: 'Beautiful handmade bracelet set', sku: 'FANCY-001', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Decorative Wall Clock', category: 'fancy', price: 899.00, quantity: 30, description: 'Vintage style decorative wall clock', sku: 'FANCY-002', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Crystal Vase Set', category: 'fancy', price: 1299.00, quantity: 25, description: 'Elegant crystal vase set', sku: 'FANCY-003', image: 'https://images.unsplash.com/photo-1578932750355-5eb30ece6a6e?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      // Electronics
      { id: uuidv4(), name: 'Wireless Bluetooth Headphones', category: 'electronics', price: 2499.00, quantity: 40, description: 'Premium wireless Bluetooth headphones', sku: 'ELEC-001', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Smart LED TV 32 inch', category: 'electronics', price: 15999.00, quantity: 15, description: '32 inch Smart LED TV', sku: 'ELEC-002', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Electrical Wire (1mm)', category: 'electronics', price: 49.00, quantity: 500, description: 'Copper electrical wire 1mm', sku: 'ELEC-011', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'PVC Electrical Pipe 20mm', category: 'electronics', price: 89.00, quantity: 300, description: 'PVC electrical conduit pipe 20mm', sku: 'ELEC-012', image: 'https://images.unsplash.com/photo-1612961514403-7ea0b3c7a0f7?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'LED Tubelight 20W', category: 'electronics', price: 449.00, quantity: 100, description: 'Energy efficient LED tubelight 20W', sku: 'ELEC-013', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() },
      { id: uuidv4(), name: 'Screws Set (Assorted)', category: 'electronics', price: 149.00, quantity: 200, description: 'Assorted electrical screws set', sku: 'ELEC-014', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date(), updatedAt: new Date() }
    ];

    await Inventory.insertMany(sampleItems);
    res.json({ message: 'Sample inventory initialized', count: sampleItems.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales Reports
app.get('/api/reports/daily', async (req, res) => {
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

app.get('/api/reports/monthly', async (req, res) => {
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

app.get('/api/reports/yearly', async (req, res) => {
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

async function generateReport(bills, period, date) {
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
}

// Download report as CSV
app.get('/api/reports/download/:type', async (req, res) => {
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

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}!`);
  console.log(`📍 Access your app at: http://localhost:${PORT}`);
  if (process.env.RENDER) {
    console.log(`☁️  Deployed on Render.com`);
  }
  console.log(`💾 Using MongoDB Cloud Database\n`);
});

