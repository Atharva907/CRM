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
    query('status').optional().isIn(['new', 'contacted', 'follow_up', 'interested', 'converted', 'lost']).withMessage('Invalid status'),
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
    
    // Get all possible statuses
    const statuses = ['new', 'contacted', 'follow_up', 'interested', 'converted', 'lost'];
    
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
    
    // Check if user is authorized to view this lead
    if (
      req.user.role === 'executive' && 
      lead.assignedTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead'
      });
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
    body('status').optional().isIn(['new', 'contacted', 'follow_up', 'interested', 'converted', 'lost']).withMessage('Invalid status'),
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
    
    // Get or create default company
    const Company = require('../models/Company');
    let companyId = req.user.companyId;
    
    if (!companyId) {
      // Check if default company exists
      let defaultCompany = await Company.findOne({ domain: 'default-company.crm' });
      
      if (!defaultCompany) {
        // Create default company if it doesn't exist
        defaultCompany = await Company.create({
          name: 'Default Company',
          domain: 'default-company.crm',
          address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
          }
        });
      }
      
      companyId = defaultCompany._id;
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
    body('status').optional().isIn(['new', 'contacted', 'follow_up', 'interested', 'converted', 'lost']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Check if lead exists
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Check if user is authorized to update this lead
    if (
      req.user.role === 'executive' && 
      lead.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }
    
    // Update fields
    const { name, email, phone, company, position, source, status, assignedTo, priority, notes, tags, lastContactDate, nextFollowUpDate } = req.body;
    
    // Check if assignedTo is valid
    if (assignedTo && !hasPermission(req.user.role, 'canViewAllLeads') && assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only assign leads to yourself'
      });
    }
    
    // Update lead
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        company,
        position,
        source,
        status,
        assignedTo,
        priority,
        notes,
        tags,
        lastContactDate,
        nextFollowUpDate
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');
    
    // Log activity
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
    
    res.status(200).json({
      success: true,
      data: updatedLead
    });
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
    
    // Check if user is authorized to delete this lead
    if (
      req.user.role === 'executive' && 
      lead.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this lead'
      });
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
// @desc    Convert lead to customer
// @access  Private
router.post('/:id/convert', 
  protect, 
  validateObjectId,
  [
    body('address.street').optional().notEmpty().withMessage('Street cannot be empty'),
    body('address.city').optional().notEmpty().withMessage('City cannot be empty'),
    body('address.state').optional().notEmpty().withMessage('State cannot be empty'),
    body('address.zip').optional().notEmpty().withMessage('Zip cannot be empty'),
    body('address.country').optional().notEmpty().withMessage('Country cannot be empty')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Check if lead exists
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }
    
    // Check if user is authorized to convert this lead
    if (
      req.user.role === 'executive' && 
      lead.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to convert this lead'
      });
    }
    
    // Check if lead is already converted
    if (lead.convertedToCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Lead is already converted to a customer'
      });
    }
    
    // Create customer from lead
    const { address } = req.body;
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      position: lead.position,
      address,
      assignedTo: lead.assignedTo,
      leadId: lead._id,
      source: lead.source,
      tags: lead.tags
    });
    
    // Update lead to mark as converted
    lead.convertedToCustomer = true;
    lead.customerId = customer._id;
    lead.status = 'converted';
    await lead.save();
    
    // Populate assignedTo field for response
    await customer.populate('assignedTo', 'name email');
    
    // Log activity
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
    
    res.status(201).json({
      success: true,
      data: customer
    });
  })
);

module.exports = router;
