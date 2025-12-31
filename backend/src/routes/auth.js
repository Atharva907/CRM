const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');
const { 
  generateToken, 
  sensitiveRateLimit, 
  sanitizeInput, 
  detectSuspiciousActivity,
  addSecurityHeaders 
} = require('../middleware/security');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', 
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'sales', 'support']).withMessage('Invalid role'),
    body('company').notEmpty().withMessage('Company name is required')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { name, email, password, role, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create a new company if it doesn't exist
    const Company = require('../models/Company');
    let companyDoc = await Company.findOne({ name: company });
    
    if (!companyDoc) {
      // Generate a domain from the company name
      const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.crm';
      
      companyDoc = await Company.create({
        name: company,
        domain: domain,
        createdBy: null // Will be updated with the user ID after creation
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      companyId: companyDoc._id,
      role: role || 'admin' // First user in a company is admin by default
    });
    
    // Update company with the user ID if this is a new company
    if (!companyDoc.createdBy) {
      await Company.findByIdAndUpdate(companyDoc._id, { createdBy: user._id });
    }

    // Create token
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshTokenValue = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Log activity
    await ActivityLog.create({
      companyId: typeof user.companyId === 'object' ? user.companyId._id : user.companyId,
      user: user._id,
      action: 'register',
      resourceType: 'User',
      resourceId: user._id,
      description: `${user.name} registered a new account`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  })
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login',
  sensitiveRateLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  sanitizeInput,
  detectSuspiciousActivity,
  addSecurityHeaders,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    console.log('Login attempt for email:', email);
    console.log('User found:', !!user);

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    console.log('Comparing password for user:', email);
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock for 2 hours
      }
      
      await user.save({ validateBeforeSave: false });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        ...(user.loginAttempts >= 4 && { attemptsRemaining: 5 - user.loginAttempts })
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Create token
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    const refreshTokenValue = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Reset login attempts and update last login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await ActivityLog.create({
      companyId: typeof user.companyId === 'object' ? user.companyId._id : user.companyId,
      user: user._id,
      action: 'login',
      resourceType: 'User',
      resourceId: user._id,
      description: `${user.name} logged in`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: refreshTokenValue,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  })
);

// @route   POST api/auth/refresh
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh', catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @route   GET api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
}));

// @route   POST api/auth/logout
// @desc    Log user out
// @access  Private
router.post('/logout', protect, catchAsync(async (req, res) => {
  // Log activity
  await ActivityLog.create({
    companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId,
    user: req.user.id,
    action: 'logout',
    resourceType: 'User',
    resourceId: req.user.id,
    description: `${req.user.name} logged out`,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
}));

module.exports = router;
