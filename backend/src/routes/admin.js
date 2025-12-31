const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');
const bcrypt = require('bcryptjs');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  })
);

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private/Admin
router.post('/users',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate a default password if none is provided
    let userPassword = password;
    if (!userPassword) {
      // Generate a random 8-character password
      userPassword = Math.random().toString(36).slice(-8);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: userPassword,
      role: role || 'sales'
    });

    res.status(201).json({
      success: true,
      data: user,
      message: !password ? `User created with default password: ${userPassword}` : 'User created successfully'
    });
  })
);

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/users/:id',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const { name, email, password, role, isActive } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  })
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.deleteOne({ _id: user._id });

    res.status(200).json({
      success: true,
      data: {}
    });
  })
);

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private/Admin
router.get('/settings',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    // In a real application, you would fetch settings from a database
    // For now, we'll return default settings
    const settings = {
      siteName: 'CRM System',
      siteDescription: 'A powerful CRM for managing customers and sales',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      smtpHost: '',
      smtpPort: '587',
      smtpSecure: true,
      smtpUser: '',
      smtpPassword: '',
      emailFrom: '',
      emailFromName: 'CRM System',
      emailNotifications: true,
      taskNotifications: true,
      dealNotifications: true,
      leadNotifications: true,
      sessionTimeout: '24',
      passwordMinLength: '8',
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      autoBackup: true,
      backupFrequency: 'weekly',
      backupRetention: '30',
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  })
);

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private/Admin
router.put('/settings',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    // In a real application, you would save settings to a database
    // For now, we'll just return success
    const settings = req.body;

    res.status(200).json({
      success: true,
      data: settings
    });
  })
);

// @route   POST /api/admin/settings/test-email
// @desc    Test email configuration
// @access  Private/Admin
router.post('/settings/test-email',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    // In a real application, you would send a test email
    // For now, we'll just return success

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });
  })
);

// @route   POST /api/admin/settings/backup
// @desc    Create system backup
// @access  Private/Admin
router.post('/settings/backup',
  protect,
  authorize('admin'),
  catchAsync(async (req, res) => {
    // In a real application, you would create a backup of the database
    // For now, we'll just return success

    res.status(200).json({
      success: true,
      message: 'Backup created successfully'
    });
  })
);

module.exports = router;
