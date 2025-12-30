const express = require('express');
const router = express.Router();

// @route   GET api/reports
// @desc    Get all reports
// @access  Private
router.get('/', (req, res) => {
  res.send('Reports route');
});

// @route   GET api/reports/leads
// @desc    Get leads report
// @access  Private
router.get('/leads', (req, res) => {
  res.send('Leads report route');
});

// @route   GET api/reports/customers
// @desc    Get customers report
// @access  Private
router.get('/customers', (req, res) => {
  res.send('Customers report route');
});

// @route   GET api/reports/deals
// @desc    Get deals report
// @access  Private
router.get('/deals', (req, res) => {
  res.send('Deals report route');
});

// @route   GET api/reports/tasks
// @desc    Get tasks report
// @access  Private
router.get('/tasks', (req, res) => {
  res.send('Tasks report route');
});

module.exports = router;
