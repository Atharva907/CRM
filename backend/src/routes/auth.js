const express = require('express');
const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', (req, res) => {
  res.send('Register route');
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', (req, res) => {
  res.send('Login route');
});

// @route   POST api/auth/refresh
// @desc    Refresh JWT token
// @access  Public
router.post('/refresh', (req, res) => {
  res.send('Refresh token route');
});

module.exports = router;
