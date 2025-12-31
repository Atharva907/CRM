const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');
const { 
  addSecurityHeaders 
} = require('../middleware/security');
const { 
  logPerformanceMetrics 
} = require('../services/performance');

// @route   GET api/performance/metrics
// @desc    Get system and application performance metrics
// @access  Private (admin only)
router.get('/metrics',
  protect,
  authorize('admin'),
  addSecurityHeaders,
  catchAsync(async (req, res) => {
    const metrics = await logPerformanceMetrics();

    res.status(200).json({
      success: true,
      data: metrics
    });
  })
);

// @route   GET api/performance/health
// @desc    Get application health status
// @access  Private
router.get('/health',
  protect,
  addSecurityHeaders,
  catchAsync(async (req, res) => {
    const mongoose = require('mongoose');

    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = Math.round(
      (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    );

    // Determine health status
    let status = 'healthy';
    
    // Check additional factors
    if (dbStatus !== 'connected' || memoryUsagePercent > 90) {
      status = 'unhealthy';
    }
    
    // Check if we can connect to database
    try {
      const db = mongoose.connection.db;
      if (!db) {
        status = 'degraded';
      }
    } catch (error) {
      status = 'degraded';
    }

    res.status(200).json({
      success: true,
      status,
      database: dbStatus,
      memoryUsage: {
        percent: memoryUsagePercent,
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
      },
      uptime: process.uptime()
    });
  })
);

module.exports = router;
