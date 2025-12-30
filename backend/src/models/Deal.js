const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a deal name'],
    trim: true,
    maxlength: [100, 'Deal name cannot be more than 100 characters']
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
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'],
    default: 'USD'
  },
  stage: {
    type: String,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'prospecting'
  },
  probability: {
    type: Number,
    min: [0, 'Probability cannot be less than 0%'],
    max: [100, 'Probability cannot be more than 100%'],
    default: 0
  },
  expectedCloseDate: {
    type: Date,
    required: [true, 'Please provide an expected close date']
  },
  actualCloseDate: {
    type: Date
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Please associate this deal with a customer']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this deal to a user']
  },
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price must be a positive number']
    },
    total: {
      type: Number,
      required: true
    }
  }],
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
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'task'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Activity description cannot be more than 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  lostReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Lost reason cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for performance
DealSchema.index({ assignedTo: 1, stage: 1 });
DealSchema.index({ customer: 1 });
DealSchema.index({ expectedCloseDate: 1 });

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
