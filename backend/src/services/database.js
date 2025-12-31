const mongoose = require('mongoose');

// Connection options for optimization
const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connect to database with optimized options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/crm',
      connectionOptions
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Set up indexes for better query performance
    setupIndexes();

    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Create indexes for frequently queried fields
const setupIndexes = async () => {
  try {
    // Load models first
    require('../models');

    // User indexes
    const User = mongoose.model('User');
    // Note: The email+companyId index is already defined in the User model with unique: true
    await User.collection.createIndex({ lastLogin: -1 });

    // Lead indexes
    const Lead = mongoose.model('Lead');
    await Lead.collection.createIndex({ assignedTo: 1, createdAt: -1 });
    await Lead.collection.createIndex({ stage: 1, assignedTo: 1 });

    // Customer indexes
    const Customer = mongoose.model('Customer');
    await Customer.collection.createIndex({ assignedTo: 1, createdAt: -1 });
    await Customer.collection.createIndex({ lastActivityAt: -1 });

    // Deal indexes
    const Deal = mongoose.model('Deal');
    await Deal.collection.createIndex({ assignedTo: 1, createdAt: -1 });
    await Deal.collection.createIndex({ stage: 1, assignedTo: 1 });
    await Deal.collection.createIndex({ customerId: 1 });

    // Task indexes
    const Task = mongoose.model('Task');
    await Task.collection.createIndex({ assignedTo: 1, dueDate: 1 });
    await Task.collection.createIndex({ status: 1, assignedTo: 1 });

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
  }
};

// Clean up expired tokens and old data
const cleanupExpiredData = async () => {
  try {
    require('../models');
    const User = mongoose.model('User');
    const now = new Date();

    // Remove expired password reset tokens
    await User.updateMany(
      { resetPasswordExpire: { $lt: now } },
      { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } }
    );

    // Unlock accounts where lock period has expired
    await User.updateMany(
      { lockUntil: { $lt: now } },
      { $unset: { lockUntil: 1 } }
    );

    console.log('Database cleanup completed');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
};

module.exports = {
  connectDB,
  setupIndexes,
  cleanupExpiredData
};
