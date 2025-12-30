const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
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
    type: Date,
    required: [true, 'Please provide a due date']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
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
  relatedTo: {
    modelType: {
      type: String,
      enum: ['Lead', 'Customer', 'Deal'],
      required: true
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
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
  }
}, {
  timestamps: true
});

// Index for performance
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ 'relatedTo.modelType': 1, 'relatedTo.modelId': 1 });

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
