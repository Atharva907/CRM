const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { hasPermission } = require('../utils/permissions');
const Deal = require('../models/Deal');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const { body, query } = require('express-validator');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

// @route   GET api/deals
// @desc    Get all deals
// @access  Private
router.get('/',
  protect,
  [
    query('stage').optional().isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    query('status').optional().isIn(['active', 'inactive', 'pending']).withMessage('Invalid status'),
    query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Build query
    const query = {};

    // Role-based filtering
    if (!hasPermission(req.user.role, 'canViewAllDeals')) {
      // Users who can't view all deals only see their own
      query.assignedTo = req.user.id;
    }
    // Users with canViewAllDeals permission can see all deals

    // Filter by stage if provided
    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by assigned user if provided (only for admins)
    if (req.query.assignedTo && req.user.role === 'admin') {
      query.assignedTo = req.query.assignedTo;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .populate('customerId', 'name email company')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      count: deals.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: deals
    });
  })
);

// @route   GET api/deals/:id
// @desc    Get single deal
// @access  Private
router.get('/:id',
  protect,
  validateObjectId(),
  catchAsync(async (req, res) => {
    const deal = await Deal.findById(req.params.id)
      .populate('customerId', 'name email company phone address')
      .populate('assignedTo', 'name email');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permissions
    if (
      req.user.role !== 'admin' &&
      req.user.id !== deal.assignedTo._id.toString() &&
      !(req.user.role === 'manager' && deal.assignedTo.department === req.user.department)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this deal'
      });
    }

    res.status(200).json({
      success: true,
      data: deal
    });
  })
);

// @route   POST api/deals
// @desc    Create new deal
// @access  Private
router.post('/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('customerId').isMongoId().withMessage('Invalid customer ID'),
    body('stage').optional().isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { title, description, value, stage, customerId, assignedTo, expectedCloseDate, tags } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Only admins and managers can assign deals to others
    let dealAssignedTo = req.user.id; // Default to current user
    if (assignedTo && (req.user.role === 'admin' || req.user.role === 'manager')) {
      dealAssignedTo = assignedTo;
    }

    // Create deal
    const deal = await Deal.create({
      title,
      description,
      value,
      stage: stage || 'prospecting',
      customerId,
      assignedTo: dealAssignedTo,
      expectedCloseDate,
      tags
    });

    // Populate related fields
    await deal.populate('customerId', 'name email company');
    await deal.populate('assignedTo', 'name email');

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'create',
      entityType: 'deal',
      entityId: deal._id,
      details: `Created deal: ${deal.title}`
    });

    res.status(201).json({
      success: true,
      data: deal
    });
  })
);

// @route   PUT api/deals/:id
// @desc    Update deal
// @access  Private
router.put('/:id',
  protect,
  validateObjectId(),
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('value').optional().isNumeric().withMessage('Value must be a number'),
    body('stage').optional().isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
    body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permissions
    if (
      req.user.role !== 'admin' &&
      req.user.id !== deal.assignedTo.toString() &&
      !(req.user.role === 'manager' && deal.assignedTo.department === req.user.department)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this deal'
      });
    }

    // Only admins and managers can change assignment
    if (req.body.assignedTo && req.user.role === 'sales') {
      delete req.body.assignedTo;
    }

    // Update deal
    deal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customerId', 'name email company')
      .populate('assignedTo', 'name email');

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'update',
      entityType: 'deal',
      entityId: deal._id,
      details: `Updated deal: ${deal.title}`
    });

    res.status(200).json({
      success: true,
      data: deal
    });
  })
);

// @route   DELETE api/deals/:id
// @desc    Delete deal
// @access  Private
router.delete('/:id',
  protect,
  validateObjectId(),
  catchAsync(async (req, res) => {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Check access permissions
    if (
      req.user.role !== 'admin' &&
      req.user.id !== deal.assignedTo.toString() &&
      !(req.user.role === 'manager' && deal.assignedTo.department === req.user.department)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this deal'
      });
    }

    await deal.remove();

    // Log activity
    await ActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      entityType: 'deal',
      entityId: deal._id,
      details: `Deleted deal: ${deal.title}`
    });

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully'
    });
  })
);

module.exports = router;