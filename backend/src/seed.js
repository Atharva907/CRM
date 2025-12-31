const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');

// Load environment variables
require('dotenv').config();

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});

    // Create a test company
    const company = await Company.create({
      name: 'Test Company',
      domain: 'testcompany.crm',
      createdBy: null
    });

    // Create a test user with a password that meets all requirements
    const user = await User.create({
      name: 'Test User',
      email: 'test@testcompany.com',
      password: 'Test123@',
      companyId: company._id,
      role: 'admin',
      isActive: true
    });

    // Update company with the user ID
    await Company.findByIdAndUpdate(company._id, { createdBy: user._id });

    console.log('Data seeded successfully!');
    console.log('Test user credentials:');
    console.log('Email: test@testcompany.com');
    console.log('Password: Test123@');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedData();
});
