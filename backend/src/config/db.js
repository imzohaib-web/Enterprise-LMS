'use strict';
const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      dbName: 'enterprise_lms',
      maxPoolSize: 10,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;
