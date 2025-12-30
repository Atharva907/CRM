const express = require('express');
const router = express.Router();

// @route   GET api/deals
// @desc    Get all deals
// @access  Private
router.get('/', (req, res) => {
  res.send('Get all deals');
});

// @route   GET api/deals/:id
// @desc    Get deal by ID
// @access  Private
router.get('/:id', (req, res) => {
  res.send('Get deal by ID');
});

// @route   POST api/deals
// @desc    Create a deal
// @access  Private
router.post('/', (req, res) => {
  res.send('Create a deal');
});

// @route   PUT api/deals/:id
// @desc    Update a deal
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update a deal');
});

// @route   DELETE api/deals/:id
// @desc    Delete a deal
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete a deal');
});

module.exports = router;
