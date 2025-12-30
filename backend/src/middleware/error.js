const mongoose = require('mongoose');

// Handle Mongoose validation errors
const handleValidationError = err => {
  const errors = Object.values(err.errors).map(val => ({
    field: val.path,
    message: val.message
  }));

  return {
    success: false,
    message: 'Validation Error',
    errors
  };
};

// Handle Mongoose duplicate key errors
const handleDuplicateFieldsError = err => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  return {
    success: false,
    message: `Duplicate field value: ${field}. Please use another value.`,
    field,
    value
  };
};

// Handle Mongoose cast error
const handleCastError = err => {
  return {
    success: false,
    message: `Invalid ${err.path}: ${err.value}.`
  };
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }
};

// Global error handler
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
      error = handleDuplicateFieldsError(err);
    }

    // Handle Mongoose cast error
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = {
        success: false,
        message: 'Invalid token. Please log in again.'
      };
    }

    // Handle JWT expired errors
    if (err.name === 'TokenExpiredError') {
      error = {
        success: false,
        message: 'Your token has expired. Please log in again.'
      };
    }

    sendErrorProd(error, res);
  }
};

// Async error catcher
exports.catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
