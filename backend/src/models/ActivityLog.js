const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify who performed this activity']
  },
  action: {
    type: String,
    required: [true, 'Please specify the action performed'],
    enum: [
      'create', 'update', 'delete', 'view', 
      'login', 'logout', 'register',
      'assign', 'unassign', 'convert',
      'won', 'lost', 'complete', 'reopen'
    ]
  },
  resourceType: {
    type: String,
    required: [true, 'Please specify the resource type'],
    enum: ['User', 'Lead', 'Customer', 'Deal', 'Task']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please specify the resource ID']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the activity'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for performance
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
