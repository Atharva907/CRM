const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', protect, authorize('admin'), catchAsync(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
}));

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Users can only view their own profile unless they're admin
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

// @route   POST api/users
// @desc    Create a user (admin only)
// @access  Private
router.post('/', 
  protect, 
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['admin', 'manager', 'sales', 'support']).withMessage('Invalid role')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { name, email, password, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      phone
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    });
  })
);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', 
  protect,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('role').optional().isIn(['admin', 'manager', 'sales', 'support']).withMessage('Invalid role')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Only admins can change roles
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change user roles'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  })
);

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Private
router.delete('/:id', protect, authorize('admin'), catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admins from deleting themselves
  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
}));

module.exports = router;
