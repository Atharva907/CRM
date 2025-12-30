const express = require('express');
const router = express.Router();

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get('/', (req, res) => {
  res.send('Get all customers');
});

// @route   GET api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get('/:id', (req, res) => {
  res.send('Get customer by ID');
});

// @route   POST api/customers
// @desc    Create a customer
// @access  Private
router.post('/', (req, res) => {
  res.send('Create a customer');
});

// @route   PUT api/customers/:id
// @desc    Update a customer
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update a customer');
});

// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete a customer');
});

module.exports = router;
