const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Please provide a company ID']
  },
  title: {
    type: String,
    required: [true, 'Please provide a deal title'],
    trim: true,
    maxlength: [100, 'Deal title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  value: {
    type: Number,
    required: [true, 'Please provide a deal value'],
    min: [0, 'Deal value must be a positive number']
  },
  stage: {
    type: String,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'prospecting'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  expectedCloseDate: {
    type: Date
  },
  actualCloseDate: {
    type: Date
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this deal to a user']
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
  lostReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Lost reason cannot be more than 500 characters']
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for performance
DealSchema.index({ companyId: 1, assignedTo: 1, stage: 1 });
DealSchema.index({ companyId: 1, customerId: 1 });
DealSchema.index({ companyId: 1, expectedCloseDate: 1 });

// Calculate probability based on stage
DealSchema.pre('save', function(next) {
  // Set probability based on stage if not explicitly set
  if (this.isModified('stage') && !this.isModified('probability')) {
    switch(this.stage) {
      case 'prospecting':
        this.probability = 10;
        break;
      case 'qualification':
        this.probability = 25;
        break;
      case 'proposal':
        this.probability = 50;
        break;
      case 'negotiation':
        this.probability = 75;
        break;
      case 'closed_won':
        this.probability = 100;
        break;
      case 'closed_lost':
        this.probability = 0;
        break;
      default:
        this.probability = 0;
    }
  }

  // Set actual close date when deal is closed
  if ((this.stage === 'closed_won' || this.stage === 'closed_lost') && !this.actualCloseDate) {
    this.actualCloseDate = new Date();
  }

  next();
});

module.exports = mongoose.model('Deal', DealSchema);
