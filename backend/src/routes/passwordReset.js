const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body } = require('express-validator');
const User = require('../models/User');
const { handleValidationErrors } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');
const { 
  generateToken, 
  sensitiveRateLimit, 
  sanitizeInput, 
  detectSuspiciousActivity,
  addSecurityHeaders 
} = require('../middleware/security');

// @route   POST api/passwordReset/forgot
// @desc    Send password reset email
// @access  Public
router.post('/forgot',
  sensitiveRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  sanitizeInput,
  detectSuspiciousActivity,
  addSecurityHeaders,
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email here
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      // In development, return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  })
);

// @route   POST api/passwordReset/reset
// @desc    Reset password
// @access  Public
router.post('/reset',
  sensitiveRateLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  sanitizeInput,
  detectSuspiciousActivity,
  addSecurityHeaders,
  [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { resetToken, password } = req.body;

    // Hash token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  })
);

module.exports = router;
