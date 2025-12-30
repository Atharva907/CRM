const express = require('express');
const router = express.Router();

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get('/', (req, res) => {
  res.send('Get all leads');
});

// @route   GET api/leads/:id
// @desc    Get lead by ID
// @access  Private
router.get('/:id', (req, res) => {
  res.send('Get lead by ID');
});

// @route   POST api/leads
// @desc    Create a lead
// @access  Private
router.post('/', (req, res) => {
  res.send('Create a lead');
});

// @route   PUT api/leads/:id
// @desc    Update a lead
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update a lead');
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete a lead');
});

module.exports = router;
