const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Check for MONGO_URL (user's preferred name) or MONGODB_URI (fallback)
    const mongoUri = process.env.MONGO_URL || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URL or MONGODB_URI environment variable is not set');
    }

    // Mongoose 8+ - no deprecated options needed
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MONGO_URL or MONGODB_URI environment variable is set correctly');
    process.exit(1);
  }
};

module.exports = connectDB;
