const express = require('express');
const router = express.Router();

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', (req, res) => {
  res.send('Get all tasks');
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', (req, res) => {
  res.send('Get task by ID');
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', (req, res) => {
  res.send('Create a task');
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update a task');
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete a task');
});

module.exports = router;
