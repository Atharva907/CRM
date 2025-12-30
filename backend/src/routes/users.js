const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private
router.get('/', (req, res) => {
  res.send('Get all users');
});

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', (req, res) => {
  res.send('Get user by ID');
});

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update user');
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete user');
});

module.exports = router;
