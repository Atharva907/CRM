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

// Delete a user
const deleteUser = async (email) => {
  try {
    if (!email) {
      console.error('Please provide an email address');
      console.log('Usage: node deleteUser.js <email>');
      process.exit(1);
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    await User.findByIdAndDelete(user._id);

    console.log(`User with email ${email} has been deleted`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

// Run the delete function
connectDB().then(() => {
  deleteUser(email);
});
