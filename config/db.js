const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ Connection FAILED:', err.message);
    process.exit(1); // Crash the app if DB fails
  }
};

module.exports = connectDB;