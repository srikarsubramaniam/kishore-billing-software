// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(mongoUri, {
      // ✅ Updated, compatible options (removed deprecated ones)
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      family: 4,
      heartbeatFrequencyMS: 10000,
      // Modern flags for stability
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection readyState: ${mongoose.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('💡 Make sure MONGO_URI or MONGODB_URI is set correctly');
    throw error;
  }
};

module.exports = connectDB;
