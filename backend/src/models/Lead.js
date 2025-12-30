const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters']
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'follow_up', 'interested', 'converted', 'lost'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this lead to a user']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastContactDate: {
    type: Date
  },
  nextFollowUpDate: {
    type: Date
  },
  convertedToCustomer: {
    type: Boolean,
    default: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }
}, {
  timestamps: true
});

// Index for performance
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ email: 1 }, { sparse: true });
LeadSchema.index({ phone: 1 }, { sparse: true });

module.exports = mongoose.model('Lead', LeadSchema);
