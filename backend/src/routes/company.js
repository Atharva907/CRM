const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Company = require('../models/Company');
const User = require('../models/User');

// @route   GET api/company
// @desc    Get company details
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId._id);
    
    if (!company) {
      return res.status(404).json({ msg: 'Company not found' });
    }
    
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/company
// @desc    Update company details
// @access  Private (Admin only)
router.put('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update company details' });
    }
    
    const {
      name,
      logo,
      address,
      phone,
      email,
      website,
      industry,
      settings
    } = req.body;
    
    // Find and update company
    const company = await Company.findByIdAndUpdate(
      req.user.companyId._id,
      {
        name,
        logo,
        address,
        phone,
        email,
        website,
        industry,
        settings
      },
      { new: true }
    );
    
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/company/setup
// @desc    Initialize company with first admin user
// @access  Public
router.post('/setup', async (req, res) => {
  try {
    const {
      companyName,
      companyDomain,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ domain: companyDomain });
    if (existingCompany) {
      return res.status(400).json({ msg: 'Company with this domain already exists' });
    }
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    
    // Create company with default settings
    const company = new Company({
      name: companyName,
      domain: companyDomain,
      settings: {
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'America/New_York',
        currency: 'USD',
        dealStages: [
          { id: 'lead', name: 'Lead', color: '#6B7280' },
          { id: 'qualified', name: 'Qualified', color: '#3B82F6' },
          { id: 'proposal', name: 'Proposal', color: '#F59E0B' },
          { id: 'negotiation', name: 'Negotiation', color: '#8B5CF6' },
          { id: 'closed-won', name: 'Closed Won', color: '#10B981' },
          { id: 'closed-lost', name: 'Closed Lost', color: '#EF4444' }
        ],
        leadSources: [
          { id: 'website', name: 'Website' },
          { id: 'referral', name: 'Referral' },
          { id: 'social', name: 'Social Media' },
          { id: 'email', name: 'Email' },
          { id: 'phone', name: 'Phone' },
          { id: 'other', name: 'Other' }
        ],
        taskPriorities: [
          { id: 'low', name: 'Low', color: '#6B7280' },
          { id: 'medium', name: 'Medium', color: '#F59E0B' },
          { id: 'high', name: 'High', color: '#EF4444' }
        ]
      }
    });
    
    await company.save();
    
    // Create admin user
    const user = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      companyId: company._id,
      role: 'admin',
      permissions: {
        canViewReports: true,
        canManageUsers: true,
        canManageSettings: true,
        canDeleteData: true,
        canExportData: true
      }
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      msg: 'Company setup successfully completed'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
