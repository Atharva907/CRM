const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(password) {
        // Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'sales', 'support'],
    default: 'sales'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  permissions: {
    // Specific permissions for this user
    canViewReports: { type: Boolean, default: true },
    canManageUsers: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canDeleteData: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index to ensure email is unique
UserSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const result = await bcrypt.compare(candidatePassword, this.password);
  return result;
};

module.exports = mongoose.model('User', UserSchema);
