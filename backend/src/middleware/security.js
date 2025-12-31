const crypto = require('crypto');

// Generate random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Rate limiting for sensitive endpoints
const sensitiveRateLimit = (max = 5, windowMs = 15 * 60 * 1000) => {
  const rateLimit = require('express-rate-limit');

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Simple XSS prevention
        req.body[key] = req.body[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    }
  }

  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    }
  }

  next();
};

// Check for suspicious activity patterns
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  // Check for suspicious patterns in request body
  if (req.body) {
    for (const key in req.body) {
      if (checkString(req.body[key])) {
        return res.status(400).json({
          success: false,
          message: 'Suspicious activity detected'
        });
      }
    }
  }

  // Check for suspicious patterns in query parameters
  if (req.query) {
    for (const key in req.query) {
      if (checkString(req.query[key])) {
        return res.status(400).json({
          success: false,
          message: 'Suspicious activity detected'
        });
      }
    }
  }

  next();
};

// Add security headers
const addSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
  );

  next();
};

module.exports = {
  generateToken,
  sensitiveRateLimit,
  sanitizeInput,
  detectSuspiciousActivity,
  addSecurityHeaders
};
