const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get('/', 
  protect,
  [
    query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Build query
    const query = {
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId
    };
    
    // Filter by assigned user if provided
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    // Filter by active status if provided
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Non-admin and non-manager users can only see their own customers
    if (req.user.role === 'executive') {
      query.assignedTo = req.user.id;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Execute query
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .populate('leadId', 'name')
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
      count: customers.length,
      pagination,
      data: customers
    });
  })
);

// @route   GET api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get('/:id', 
  protect, 
  validateObjectId,
  catchAsync(async (req, res) => {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('leadId', 'name')
      .populate('notes.createdBy', 'name');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to view this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this customer'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  })
);

// @route   POST api/customers
// @desc    Create new customer
// @access  Private
router.post('/', 
  protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source').optional().isIn(['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other']).withMessage('Invalid source'),
    body('assignedTo').isMongoId().withMessage('Invalid assignedTo ID')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { name, email, phone, company, position, address, source, assignedTo, tags, leadId } = req.body;
    
    // Check if assigned user exists and is valid
    if (req.user.role === 'executive' && assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Executives can only assign customers to themselves'
      });
    }
    
    // Check if customer with this email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }
    
    // Create customer
    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      position,
      address,
      source: source || 'other',
      assignedTo: assignedTo || req.user.id,
      tags,
      leadId,
      companyId: typeof req.user.companyId === 'object' ? req.user.companyId._id : req.user.companyId
    });
    
    // Populate fields for response
    await customer.populate('assignedTo', 'name email');
    if (customer.leadId) {
      await customer.populate('leadId', 'name');
    }
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} created customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      success: true,
      data: customer
    });
  })
);

// @route   PUT api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', 
  protect, 
  validateObjectId,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('source').optional().isIn(['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other']).withMessage('Invalid source')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    // Check if customer exists
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to update this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this customer'
      });
    }
    
    // Update fields
    const { name, email, phone, company, position, address, source, assignedTo, tags, isActive, lastContactDate } = req.body;
    
    // Check if assignedTo is valid
    if (assignedTo && req.user.role === 'executive' && assignedTo !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Executives can only assign customers to themselves'
      });
    }
    
    // Check if email is already taken by another customer
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        company,
        position,
        address,
        source,
        assignedTo,
        tags,
        isActive,
        lastContactDate
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email').populate('leadId', 'name');
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} updated customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      data: updatedCustomer
    });
  })
);

// @route   DELETE api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', 
  protect, 
  validateObjectId,
  catchAsync(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to delete this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this customer'
      });
    }
    
    // Check if customer has any deals
    const dealsCount = await Deal.countDocuments({ customer: req.params.id });
    if (dealsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing deals'
      });
    }
    
    await Customer.findByIdAndDelete(req.params.id);
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} deleted customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  })
);

// @route   POST api/customers/:id/notes
// @desc    Add note to customer
// @access  Private
router.post('/:id/notes', 
  protect, 
  validateObjectId,
  [
    body('text').notEmpty().withMessage('Note text is required')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { text } = req.body;
    
    // Check if customer exists
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to add note to this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add note to this customer'
      });
    }
    
    // Add note
    const note = {
      text,
      createdBy: req.user.id,
      createdAt: new Date()
    };
    
    customer.notes.push(note);
    await customer.save();
    
    // Populate the new note
    await customer.populate('notes.createdBy', 'name');
    const newNote = customer.notes[customer.notes.length - 1];
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'create',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} added note to customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      success: true,
      data: newNote
    });
  })
);

// @route   PUT api/customers/:id/notes/:noteId
// @desc    Update note on customer
// @access  Private
router.put('/:id/notes/:noteId', 
  protect, 
  validateObjectId,
  [
    body('text').notEmpty().withMessage('Note text is required')
  ],
  handleValidationErrors,
  catchAsync(async (req, res) => {
    const { text } = req.body;
    const { id, noteId } = req.params;
    
    // Check if customer exists
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to update note on this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update note on this customer'
      });
    }
    
    // Find the note
    const note = customer.notes.id(noteId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user created this note or is admin/manager
    if (
      req.user.role === 'executive' && 
      note.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }
    
    // Update note
    note.text = text;
    await customer.save();
    
    // Populate the updated note
    await customer.populate('notes.createdBy', 'name');
    const updatedNote = customer.notes.id(noteId);
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'update',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} updated note on customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      data: updatedNote
    });
  })
);

// @route   DELETE api/customers/:id/notes/:noteId
// @desc    Delete note from customer
// @access  Private
router.delete('/:id/notes/:noteId', 
  protect, 
  validateObjectId,
  catchAsync(async (req, res) => {
    const { id, noteId } = req.params;
    
    // Check if customer exists
    const customer = await Customer.findById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Check if user is authorized to delete note from this customer
    if (
      req.user.role === 'executive' && 
      customer.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete note from this customer'
      });
    }
    
    // Find the note
    const note = customer.notes.id(noteId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user created this note or is admin/manager
    if (
      req.user.role === 'executive' && 
      note.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }
    
    // Remove note
    customer.notes.pull(noteId);
    await customer.save();
    
    // Log activity
    await ActivityLog.create({
      user: req.user.id,
      action: 'delete',
      resourceType: 'Customer',
      resourceId: customer._id,
      description: `${req.user.name} deleted note from customer ${customer.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  })
);

module.exports = router;
