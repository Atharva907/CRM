const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Load models
require('./models');

// Import database services
const { connectDB, setupIndexes, cleanupExpiredData } = require('./services/database');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// Parse cookies for HttpOnly JWT cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware with size limit
app.use(express.json({ 
  extended: false, 
  limit: '10mb' 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Add compression for responses
const compression = require('compression');
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Database connection
connectDB();

// Schedule cleanup job to run daily
const cron = require('node-cron');
cron.schedule('0 2 * * *', () => {
  // Run at 2 AM every day
  cleanupExpiredData();
  console.log('Scheduled database cleanup completed');
});

// Define routes
app.get('/', (req, res) => res.send('CRM API is running'));

// Define API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/passwordReset', require('./routes/passwordReset'));
app.use('/api/company', require('./routes/company'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
const { globalErrorHandler } = require('./middleware/error');
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
