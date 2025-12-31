const mongoose = require('mongoose');
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

// List all users
const listUsers = async () => {
  try {
    const users = await User.find({}).populate('companyId');

    console.log('All Users:');
    console.log('----------------------------------------');

    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Company: ${user.companyId ? user.companyId.name : 'N/A'}`);
      console.log(`Active: ${user.isActive}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('----------------------------------------');
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the list function
connectDB().then(() => {
  listUsers();
});
