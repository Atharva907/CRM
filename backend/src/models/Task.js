const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Please provide a company ID']
  },
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Task title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign this task to a user']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify who created this task']
  },
  relatedToLeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  relatedToCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  relatedToDealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    date: Date,
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Reminder message cannot be more than 200 characters']
    }
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for performance
TaskSchema.index({ companyId: 1, assignedTo: 1, status: 1 });
TaskSchema.index({ companyId: 1, dueDate: 1 });
TaskSchema.index({ companyId: 1, relatedToLeadId: 1 });
TaskSchema.index({ companyId: 1, relatedToCustomerId: 1 });
TaskSchema.index({ companyId: 1, relatedToDealId: 1 });

// Set completedAt when status is changed to completed
TaskSchema.pre('save', function(next) {
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'completed') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
