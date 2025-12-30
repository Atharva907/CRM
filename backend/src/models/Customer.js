const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
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
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this customer to a user']
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'email', 'phone', 'advertisement', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: [{
    text: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastContactDate: {
    type: Date
  },
  totalValue: {
    type: Number,
    default: 0
  },
  dealsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
CustomerSchema.index({ assignedTo: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ leadId: 1 });

module.exports = mongoose.model('Customer', CustomerSchema);
