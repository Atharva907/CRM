const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Deal = require('../models/Deal');
const { validationResult } = require('express-validator');

// @route   GET api/deals
// @desc    Get all deals
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, stage, search } = req.query;
    const query = { assignedTo: req.user.id };
    
    // Filter by stage if provided
    if (stage) {
      query.stage = stage;
    }
    
    // Search by title or customer name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const deals = await Deal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('customerId', 'name email');
      
    const total = await Deal.countDocuments(query);
    
    res.json({
      deals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/deals/:id
// @desc    Get deal by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id).populate('customerId', 'name email phone');
    
    if (!deal) {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    
    // Check if user is authorized to view this deal
    if (deal.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/deals
// @desc    Create a deal
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, value, stage, customerId, expectedCloseDate } = req.body;
    
    // Simple validation
    if (!title || !stage) {
      return res.status(400).json({ msg: 'Title and stage are required' });
    }
    
    const newDeal = new Deal({
      title,
      description,
      value,
      stage,
      customerId,
      expectedCloseDate,
      assignedTo: req.user.id
    });
    
    const deal = await newDeal.save();
    await deal.populate('customerId', 'name email');
    
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/deals/:id
// @desc    Update a deal
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, value, stage, customerId, expectedCloseDate, status } = req.body;
    
    // Find deal
    let deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    
    // Check if user is authorized to update this deal
    if (deal.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update fields
    if (title) deal.title = title;
    if (description) deal.description = description;
    if (value !== undefined) deal.value = value;
    if (stage) deal.stage = stage;
    if (customerId) deal.customerId = customerId;
    if (expectedCloseDate) deal.expectedCloseDate = expectedCloseDate;
    if (status) deal.status = status;
    
    deal.updatedAt = Date.now();
    
    await deal.save();
    await deal.populate('customerId', 'name email');
    
    res.json(deal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/deals/:id
// @desc    Delete a deal
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    
    if (!deal) {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    
    // Check if user is authorized to delete this deal
    if (deal.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Deal.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Deal removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Deal not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
