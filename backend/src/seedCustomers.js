const mongoose = require('mongoose');
const Customer = require('./models/Customer');
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

// Seed customers
const seedCustomers = async () => {
  try {
    // Clear existing customers
    await Customer.deleteMany({});

    // Get the test user and company
    const user = await User.findOne({ email: 'test@testcompany.com' }).populate('companyId');
    if (!user) {
      console.error('Test user not found. Please run npm run seed first.');
      process.exit(1);
    }

    // Create sample customers
    const customers = [
      {
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '555-0101',
        address: '123 Main St, Anytown, USA',
        industry: 'Technology',
        website: 'https://acme.com',
        notes: [{ text: 'Large enterprise client with multiple departments', createdBy: user._id }],
        tags: ['enterprise', 'technology', 'repeat'],
        companyId: user.companyId._id,
        assignedTo: user._id
      },
      {
        name: 'Global Industries',
        email: 'info@globalindustries.com',
        phone: '555-0102',
        address: '456 Oak Ave, Big City, USA',
        industry: 'Manufacturing',
        website: 'https://globalindustries.com',
        notes: [{ text: 'Potential for long-term partnership', createdBy: user._id }],
        tags: ['manufacturing', 'partnership'],
        companyId: user.companyId._id,
        assignedTo: user._id
      },
      {
        name: 'Tech Solutions Inc',
        email: 'hello@techsolutions.com',
        phone: '555-0103',
        address: '789 Pine Rd, Innovation City, USA',
        industry: 'Software',
        website: 'https://techsolutions.com',
        notes: [{ text: 'Startup with rapid growth', createdBy: user._id }],
        tags: ['startup', 'software', 'growth'],
        companyId: user.companyId._id,
        assignedTo: user._id
      },
      {
        name: 'Retail Giant',
        email: 'business@retailgiant.com',
        phone: '555-0104',
        address: '321 Commerce Blvd, Market Town, USA',
        industry: 'Retail',
        website: 'https://retailgiant.com',
        notes: [{ text: 'Large retail chain with multiple locations', createdBy: user._id }],
        tags: ['retail', 'chain', 'large'],
        companyId: user.companyId._id,
        assignedTo: user._id
      },
      {
        name: 'Healthcare Plus',
        email: 'admin@healthcareplus.com',
        phone: '555-0105',
        address: '654 Medical Park, Health City, USA',
        industry: 'Healthcare',
        website: 'https://healthcareplus.com',
        notes: [{ text: 'Medical services provider with multiple clinics', createdBy: user._id }],
        tags: ['healthcare', 'medical', 'clinics'],
        companyId: user.companyId._id,
        assignedTo: user._id
      }
    ];

    // Insert the customers
    await Customer.insertMany(customers);

    console.log('Sample customers created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedCustomers();
});
