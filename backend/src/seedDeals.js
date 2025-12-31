const mongoose = require('mongoose');
const Deal = require('./models/Deal');
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

// Seed deals
const seedDeals = async () => {
  try {
    // Clear existing deals
    await Deal.deleteMany({});

    // Get the test user and company
    const user = await User.findOne({ email: 'test@testcompany.com' }).populate('companyId');
    if (!user) {
      console.error('Test user not found. Please run npm run seed first.');
      process.exit(1);
    }

    // Create some sample customers if they don't exist
    const customers = await Customer.find({ companyId: user.companyId._id });
    if (customers.length === 0) {
      console.error('No customers found. Please seed customers first.');
      process.exit(1);
    }

    // Create sample deals
    const deals = [
      {
        title: 'Website Redesign Project',
        description: 'Complete website redesign for corporate client',
        value: 15000,
        stage: 'proposal',
        status: 'active',
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        companyId: user.companyId._id,
        customerId: customers[0]._id,
        assignedTo: user._id,
        tags: ['web', 'design', 'corporate']
      },
      {
        title: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android',
        value: 35000,
        stage: 'negotiation',
        status: 'active',
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        companyId: user.companyId._id,
        customerId: customers[1]?._id || customers[0]._id,
        assignedTo: user._id,
        tags: ['mobile', 'app', 'development']
      },
      {
        title: 'SEO Optimization',
        description: 'Search engine optimization for e-commerce site',
        value: 8000,
        stage: 'qualification',
        status: 'active',
        expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        companyId: user.companyId._id,
        customerId: customers[2]?._id || customers[0]._id,
        assignedTo: user._id,
        tags: ['seo', 'marketing', 'ecommerce']
      },
      {
        title: 'Cloud Migration',
        description: 'Migrate infrastructure to cloud platform',
        value: 50000,
        stage: 'prospecting',
        status: 'active',
        expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        companyId: user.companyId._id,
        customerId: customers[3]?._id || customers[0]._id,
        assignedTo: user._id,
        tags: ['cloud', 'infrastructure', 'migration']
      },
      {
        title: 'CRM Implementation',
        description: 'Implement and customize CRM system',
        value: 12000,
        stage: 'closed_won',
        status: 'active',
        actualCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        companyId: user.companyId._id,
        customerId: customers[4]?._id || customers[0]._id,
        assignedTo: user._id,
        tags: ['crm', 'implementation', 'software']
      }
    ];

    // Insert the deals
    await Deal.insertMany(deals);

    console.log('Sample deals created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the seed function
connectDB().then(() => {
  seedDeals();
});
