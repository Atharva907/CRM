const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { hasPermission } = require('../utils/permissions');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

// @route   GET api/leads
// @desc    Get all leads
// @access  Private
router.get('/', 
  protect,
  [
    query('status').optional().isIn(['new', 'contacted', 'follow_up', 'qualified', 'converted', 'lost']).withMessage('Invalid status'),
    query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by assigned user if provided
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    // Role-based filtering
    if (!hasPermission(req.user.role, 'canViewAllLeads')) {
      // Users who can't view all leads only see their own
      query.assignedTo = req.user.id;
    }
    // Users with canViewAllLeads permission can see all leads
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    
    // Pagination result
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };
    
    res.status(200).json({
      success: true,
      count: leads.length,
      pagination,
      data: leads
    });
  })
);

// @route   GET api/leads/kanban
// @desc    Get leads organized by status for Kanban view
// @access  Private
router.get('/kanban', 
  protect,
  catchAsync(async (req, res) => {
    // Build query based on user permissions
    const query = {};
    if (!hasPermission(req.user.role, 'canViewAllLeads')) {
      query.assignedTo = req.user.id;
    }
    
    // Get all possible statuses (aligned with validators)
    const statuses = ['new', 'contacted', 'follow_up', 'qualified', 'converted', 'lost'];
    
    // Get leads for each status
    const kanbanData = await Promise.all(
      statuses.map(async status => {
        const leads = await Lead.find({ ...query, status })
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 });
        
        return {
          status,
          leads
        };
      })
    );
    
    res.status(200).json({
      success: true,
      data: kanbanData
    });
  })
);

// @route   GET api/leads/:id
// @desc    Get lead by ID
// @access  Private
router.get('/:id', 
  protect, 
  validateObjectId,
  catchAsync(async (req, res) => {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Authorization: sales can view own leads; manager/admin can view all
    const canViewAll = hasPermission(req.user.role, 'canViewAllLeads');
    if (!canViewAll && lead.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this lead' });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  })
);

// @route   POST api/leads
// @desc    Create new lead
// @access  Private
router.post('/', 
  protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source').optional().isIn(['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other']).withMessage('Invalid source'),
    body('status').optional().isIn(['new', 'contacted', 'follow_up', 'qualified', 'converted', 'lost']).withMessage('Invalid status'),
    body('assignedTo').isMongoId().withMessage('Invalid assignedTo ID')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { name, email, phone, company, position, source, status, assignedTo, priority, notes, tags, lastContactDate, nextFollowUpDate } = req.body;
    
    // Check if assigned user exists and is valid
    if (!hasPermission(req.user.role, 'canViewAllLeads') && assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign leads to yourself'
      });
    }
    
    // Resolve single company context: prefer env COMPANY_ID, then user.companyId, then first Company
    const Company = require('../models/Company');
    let companyId = process.env.COMPANY_ID || req.user.companyId;

    if (!companyId) {
      const firstCompany = await Company.findOne().select('_id');
      if (!firstCompany) {
        return res.status(500).json({ success: false, message: 'No company found. Please seed a company or set COMPANY_ID env variable.' });
      }
      companyId = firstCompany._id;
    }
    
    // Create lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      position,
      source: source || 'other',
      status: status || 'new',
      assignedTo: assignedTo || req.user.id,
      companyId,
      priority: priority || 'medium',
      notes,
      tags,
      lastContactDate,
      nextFollowUpDate
    });
    
    // Populate assignedTo field for response
    await lead.populate('assignedTo', 'name email');
    
    // Log activity
    await ActivityLog.create({
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId,
      user: req.user.id,
      action: 'create',
      resourceType: 'Lead',
      resourceId: lead._id,
      description: `${req.user.name} created lead for ${lead.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      success: true,
      data: lead
    });
  })
);

// DUPLICATE CONVERT ROUTE REMOVED - use single, unified implementation below

// @route   PUT api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', 
  protect, 
  validateObjectId,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source').optional().isIn(['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other']).withMessage('Invalid source'),
    body('status').optional().isIn(['new', 'contacted', 'follow_up', 'qualified', 'converted', 'lost']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Authorization: sales can only update own leads; manager/admin can update any
    const isOwner = lead.assignedTo.toString() === req.user.id;
    const canUpdateAll = hasPermission(req.user.role, 'canUpdateAllLeads');
    if (!isOwner && !canUpdateAll) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lead' });
    }

    const { name, email, phone, company, position, source, status, assignedTo, priority, notes, tags, lastContactDate, nextFollowUpDate } = req.body;

    if (assignedTo && !hasPermission(req.user.role, 'canViewAllLeads') && assignedTo !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only assign leads to yourself' });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, company, position, source, status, assignedTo, priority, notes, tags, lastContactDate, nextFollowUpDate },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    await ActivityLog.create({
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId,
      user: req.user.id,
      action: 'update',
      resourceType: 'Lead',
      resourceId: lead._id,
      description: `${req.user.name} updated lead for ${lead.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({ success: true, data: updatedLead });
  })
);

// @route   DELETE api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', 
  protect, 
  validateObjectId,
  catchAsync(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Authorization: owner can delete own; admin can delete any; manager can delete via canUpdateAllLeads or a specific delete permission
    const isOwner = lead.assignedTo.toString() === req.user.id;
    const canDeleteAny = hasPermission(req.user.role, 'canDeleteAnyData') || hasPermission(req.user.role, 'canUpdateAllLeads');
    if (!isOwner && !canDeleteAny) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lead' });
    }
    
    await Lead.findByIdAndDelete(req.params.id);
    
    // Log activity
    await ActivityLog.create({
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId,
      user: req.user.id,
      action: 'delete',
      resourceType: 'Lead',
      resourceId: lead._id,
      description: `${req.user.name} deleted lead for ${lead.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  })
);

// @route   POST api/leads/:id/convert
// @desc    Convert lead to customer (single consolidated route)
// @access  Private
router.post('/:id/convert', 
  protect, 
  validateObjectId,
  [
    body('address.street').optional().notEmpty(),
    body('address.city').optional().notEmpty(),
    body('address.state').optional().notEmpty(),
    body('address.zip').optional().notEmpty(),
    body('address.country').optional().notEmpty()
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const isOwner = lead.assignedTo.toString() === req.user.id;
    const canConvertAll = hasPermission(req.user.role, 'canConvertAllLeads');
    const canConvertOwn = hasPermission(req.user.role, 'canConvertLeads');

    if (!isOwner && !canConvertAll) {
      return res.status(403).json({ success: false, message: 'Not authorized to convert this lead' });
    }
    if (!canConvertOwn && !canConvertAll) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    if (lead.convertedToCustomer || lead.status === 'converted') {
      return res.status(400).json({ success: false, message: 'Lead is already converted' });
    }

    // Prevent duplicate customer by this lead
    const existingByLead = await Customer.findOne({ leadId: lead._id });
    if (existingByLead) {
      return res.status(400).json({ success: false, message: 'Customer already exists for this lead' });
    }

    const { address } = req.body;
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      address: address || lead.address || {},
      assignedTo: lead.assignedTo,
      leadId: lead._id,
      source: lead.source,
      tags: lead.tags
    });

    lead.convertedToCustomer = true;
    lead.customerId = customer._id;
    lead.status = 'converted';
    await lead.save();

    await customer.populate('assignedTo', 'name email');

    await ActivityLog.create({
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId,
      user: req.user.id,
      action: 'convert',
      resourceType: 'Lead',
      resourceId: lead._id,
      description: `${req.user.name} converted lead ${lead.name} to customer`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({ success: true, data: customer });
  })
);

module.exports = router;
