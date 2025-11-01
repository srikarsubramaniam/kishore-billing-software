// This is the ORIGINAL server.js for local JSON file storage
// Keep this file if you want to run locally with JSON files
// For cloud deployment, use server.js (which uses MongoDB)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize inventory file if it doesn't exist
if (!fs.existsSync(INVENTORY_FILE)) {
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify([], null, 2));
}

// Initialize bills file if it doesn't exist
if (!fs.existsSync(BILLS_FILE)) {
  fs.writeFileSync(BILLS_FILE, JSON.stringify([], null, 2));
}

// Helper function to read inventory
function readInventory() {
  try {
    const data = fs.readFileSync(INVENTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write inventory
function writeInventory(inventory) {
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
}

// Helper function to read bills
function readBills() {
  try {
    const data = fs.readFileSync(BILLS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write bills
function writeBills(bills) {
  fs.writeFileSync(BILLS_FILE, JSON.stringify(bills, null, 2));
}

// Get all inventory items
app.get('/api/inventory', (req, res) => {
  const inventory = readInventory();
  res.json(inventory);
});

// Get inventory items by category
app.get('/api/inventory/:category', (req, res) => {
  const category = req.params.category;
  const inventory = readInventory();
  const filtered = inventory.filter(item => item.category.toLowerCase() === category.toLowerCase());
  res.json(filtered);
});

// Get single inventory item
app.get('/api/inventory/item/:id', (req, res) => {
  const id = req.params.id;
  const inventory = readInventory();
  const item = inventory.find(i => i.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Add new inventory item
app.post('/api/inventory', (req, res) => {
  const inventory = readInventory();
  const newItem = {
    id: uuidv4(),
    name: req.body.name,
    category: req.body.category,
    price: parseFloat(req.body.price),
    quantity: parseInt(req.body.quantity),
    description: req.body.description || '',
    sku: req.body.sku || '',
    image: req.body.image || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  inventory.push(newItem);
  writeInventory(inventory);
  res.json(newItem);
});

// Update inventory item
app.put('/api/inventory/:id', (req, res) => {
  const id = req.params.id;
  const inventory = readInventory();
  const index = inventory.findIndex(i => i.id === id);
  
  if (index !== -1) {
    inventory[index] = {
      ...inventory[index],
      ...req.body,
      id: id,
      updatedAt: new Date().toISOString()
    };
    writeInventory(inventory);
    res.json(inventory[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
  const id = req.params.id;
  const inventory = readInventory();
  const filtered = inventory.filter(i => i.id !== id);
  writeInventory(filtered);
  res.json({ message: 'Item deleted successfully' });
});

// Create new bill
app.post('/api/bills', (req, res) => {
  const bills = readBills();
  const inventory = readInventory();
  
  const billItems = req.body.items.map(item => {
    const invItem = inventory.find(i => i.id === item.id);
    return {
      ...item,
      name: invItem ? invItem.name : item.name,
      price: invItem ? invItem.price : item.price
    };
  });
  
  const total = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newBill = {
    id: uuidv4(),
    billNumber: `BILL-${Date.now()}`,
    items: billItems,
    total: total,
    customerName: req.body.customerName || '',
    customerPhone: req.body.customerPhone || '',
    paymentMethod: req.body.paymentMethod || 'cash',
    createdAt: new Date().toISOString()
  };
  
  // Update inventory quantities
  billItems.forEach(billItem => {
    const invItem = inventory.find(i => i.id === billItem.id);
    if (invItem && invItem.quantity >= billItem.quantity) {
      invItem.quantity -= billItem.quantity;
      invItem.updatedAt = new Date().toISOString();
    }
  });
  writeInventory(inventory);
  
  bills.push(newBill);
  writeBills(bills);
  res.json(newBill);
});

// Get all bills
app.get('/api/bills', (req, res) => {
  const bills = readBills();
  res.json(bills);
});

// Get single bill
app.get('/api/bills/:id', (req, res) => {
  const id = req.params.id;
  const bills = readBills();
  const bill = bills.find(b => b.id === id);
  if (bill) {
    res.json(bill);
  } else {
    res.status(404).json({ error: 'Bill not found' });
  }
});

// Initialize sample inventory
app.post('/api/inventory/initialize', (req, res) => {
  const inventory = readInventory();
  if (inventory.length > 0) {
    return res.json({ message: 'Inventory already initialized', count: inventory.length });
  }

  const sampleItems = [
    // Fancy Items
    { id: uuidv4(), name: 'Handmade Bracelet Set', category: 'fancy', price: 299.00, quantity: 50, description: 'Beautiful handmade bracelet set', sku: 'FANCY-001', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Decorative Wall Clock', category: 'fancy', price: 899.00, quantity: 30, description: 'Vintage style decorative wall clock', sku: 'FANCY-002', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Crystal Vase Set', category: 'fancy', price: 1299.00, quantity: 25, description: 'Elegant crystal vase set', sku: 'FANCY-003', image: 'https://images.unsplash.com/photo-1578932750355-5eb30ece6a6e?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    // Electronics
    { id: uuidv4(), name: 'Wireless Bluetooth Headphones', category: 'electronics', price: 2499.00, quantity: 40, description: 'Premium wireless Bluetooth headphones', sku: 'ELEC-001', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Smart LED TV 32 inch', category: 'electronics', price: 15999.00, quantity: 15, description: '32 inch Smart LED TV', sku: 'ELEC-002', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Electrical Wire (1mm)', category: 'electronics', price: 49.00, quantity: 500, description: 'Copper electrical wire 1mm', sku: 'ELEC-011', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'PVC Electrical Pipe 20mm', category: 'electronics', price: 89.00, quantity: 300, description: 'PVC electrical conduit pipe 20mm', sku: 'ELEC-012', image: 'https://images.unsplash.com/photo-1612961514403-7ea0b3c7a0f7?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'LED Tubelight 20W', category: 'electronics', price: 449.00, quantity: 100, description: 'Energy efficient LED tubelight 20W', sku: 'ELEC-013', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Screws Set (Assorted)', category: 'electronics', price: 149.00, quantity: 200, description: 'Assorted electrical screws set', sku: 'ELEC-014', image: 'https://images.unsplash.com/photo-1600878455253-4c71c1d9e3dc?w=400&h=400&fit=crop', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ];

  sampleItems.forEach(item => {
    inventory.push(item);
  });

  writeInventory(inventory);
  res.json({ message: 'Sample inventory initialized', count: sampleItems.length });
});

// Sales Reports
app.get('/api/reports/daily', (req, res) => {
  const bills = readBills();
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);

  const dailyBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate >= date && billDate < nextDate;
  });

  const report = generateReport(dailyBills, 'daily', date);
  res.json(report);
});

app.get('/api/reports/monthly', (req, res) => {
  const bills = readBills();
  const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const monthlyBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate >= startDate && billDate <= endDate;
  });

  const report = generateReport(monthlyBills, 'monthly', startDate);
  res.json(report);
});

app.get('/api/reports/yearly', (req, res) => {
  const bills = readBills();
  const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const yearlyBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate >= startDate && billDate <= endDate;
  });

  const report = generateReport(yearlyBills, 'yearly', startDate);
  res.json(report);
});

function generateReport(bills, period, date) {
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
  
  const categoryStats = {};
  bills.forEach(bill => {
    bill.items.forEach(item => {
      const inventory = readInventory();
      const invItem = inventory.find(i => i.id === item.id);
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
app.get('/api/reports/download/:type', (req, res) => {
  const type = req.params.type;
  let bills = [];
  let filename = '';
  
  if (type === 'daily') {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    bills = readBills().filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= date && billDate < nextDate;
    });
    filename = `sales_report_daily_${date.toISOString().split('T')[0]}.csv`;
  } else if (type === 'monthly') {
    const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    bills = readBills().filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= startDate && billDate <= endDate;
    });
    filename = `sales_report_monthly_${year}_${month}.csv`;
  } else if (type === 'yearly') {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    bills = readBills().filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= startDate && billDate <= endDate;
    });
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
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Find local IP address
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        localIP = address.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`\n🚀 Server is running!`);
  console.log(`📍 Local access: http://localhost:${PORT}`);
  console.log(`📱 Mobile access: http://${localIP}:${PORT}`);
  console.log(`\n💡 Make sure your phone is on the same Wi-Fi network!\n`);
});


