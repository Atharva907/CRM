const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  domain: {
    type: String,
    required: [true, 'Please provide a company domain'],
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  settings: {
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    timeFormat: { type: String, default: '12h' },
    timezone: { type: String, default: 'America/New_York' },
    currency: { type: String, default: 'USD' },
    // Custom deal stages specific to this company
    dealStages: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, default: '#6B7280' }
    }],
    // Custom lead sources specific to this company
    leadSources: [{
      id: { type: String, required: true },
      name: { type: String, required: true }
    }],
    // Custom task priorities specific to this company
    taskPriorities: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      color: { type: String, default: '#6B7280' }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: { type: String, enum: ['basic', 'professional', 'enterprise'], default: 'basic' },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);
