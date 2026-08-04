'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    const adminEmail = 'admin@enterprise.lms';
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      console.log('Admin account already exists:', adminEmail);
    } else {
      const admin = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Default Admin created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: AdminPassword123!');
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
