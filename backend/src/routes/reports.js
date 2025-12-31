const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { cacheMiddleware } = require('../services/cache');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// Helper function to get date range based on filter
const getDateRange = (dateRange) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (dateRange) {
    case '7days':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      // Default to 30 days
      startDate.setDate(now.getDate() - 30);
  }
  
  return { startDate, endDate: now };
};

// Helper function to calculate previous period for comparison
const getPreviousPeriod = (startDate, endDate) => {
  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
  
  return { startDate: prevStartDate, endDate: prevEndDate };
};

// Helper function to calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

// @route   GET api/reports/stats
// @desc    Get stats for dashboard
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get total counts
    const [
      totalLeads,
      totalCustomers,
      totalDeals,
      pendingTasks
    ] = await Promise.all([
      Lead.countDocuments({ assignedTo: req.user.id }),
      Customer.countDocuments({ assignedTo: req.user.id }),
      Deal.countDocuments({ assignedTo: req.user.id }),
      Task.countDocuments({ assignedTo: req.user.id, status: 'pending' })
    ]);

    res.json({
      data: {
        totalLeads,
        totalCustomers,
        totalDeals,
        pendingTasks
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports
// @desc    Get overview report
// @access  Private
router.get('/', protect, cacheMiddleware(300), async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriod(startDate, endDate);
    
    // Get counts for current period
    const [
      totalLeads,
      totalCustomers,
      dealsResult,
      tasksCompleted
    ] = await Promise.all([
      Lead.countDocuments({ 
        assignedTo: req.user.id, 
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      Customer.countDocuments({ 
        assignedTo: req.user.id, 
        createdAt: { $gte: startDate, $lte: endDate } 
      }),
      Deal.aggregate([
        { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalValue: { $sum: "$value" }, count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ 
        assignedTo: req.user.id, 
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate } 
      })
    ]);
    
    // Get counts for previous period
    const [
      prevTotalLeads,
      prevTotalCustomers,
      prevDealsResult,
      prevTasksCompleted
    ] = await Promise.all([
      Lead.countDocuments({ 
        assignedTo: req.user.id, 
        createdAt: { $gte: prevStartDate, $lte: prevEndDate } 
      }),
      Customer.countDocuments({ 
        assignedTo: req.user.id, 
        createdAt: { $gte: prevStartDate, $lte: prevEndDate } 
      }),
      Deal.aggregate([
        { $match: { assignedTo: req.user._id, createdAt: { $gte: prevStartDate, $lte: prevEndDate } } },
        { $group: { _id: null, totalValue: { $sum: "$value" }, count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ 
        assignedTo: req.user.id, 
        status: 'completed',
        completedAt: { $gte: prevStartDate, $lte: prevEndDate } 
      })
    ]);
    
    const totalDealValue = dealsResult.length > 0 ? dealsResult[0].totalValue : 0;
    const prevTotalDealValue = prevDealsResult.length > 0 ? prevDealsResult[0].totalValue : 0;
    
    const reportData = {
      totalLeads,
      leadsGrowth: calculateGrowth(totalLeads, prevTotalLeads),
      totalCustomers,
      customersGrowth: calculateGrowth(totalCustomers, prevTotalCustomers),
      totalDealValue,
      dealsGrowth: calculateGrowth(totalDealValue, prevTotalDealValue),
      tasksCompleted,
      tasksGrowth: calculateGrowth(tasksCompleted, prevTasksCompleted)
    };
    
    // Use cache if available
    if (res.locals.cacheResponse) {
      return res.locals.cacheResponse(reportData);
    }
    
    res.json(reportData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/leads
// @desc    Get leads report
// @access  Private
router.get('/leads', protect, async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get leads by stage
    const leadsByStage = await Lead.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$stage", count: { $sum: 1 } } }
    ]);
    
    // Get conversion stats
    const totalLeads = await Lead.countDocuments({ 
      assignedTo: req.user.id, 
      createdAt: { $gte: startDate, $lte: endDate } 
    });
    
    const convertedLeads = await Lead.countDocuments({ 
      assignedTo: req.user.id, 
      stage: 'customer',
      createdAt: { $gte: startDate, $lte: endDate } 
    });
    
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    // Get leads by source
    const leadsBySource = await Lead.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    
    res.json({
      total: totalLeads,
      new: leadsByStage.find(s => s._id === 'new')?.count || 0,
      contacted: leadsByStage.find(s => s._id === 'contacted')?.count || 0,
      qualified: leadsByStage.find(s => s._id === 'qualified')?.count || 0,
      converted: convertedLeads,
      conversionRate,
      byStage: leadsByStage,
      bySource: leadsBySource
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/customers
// @desc    Get customers report
// @access  Private
router.get('/customers', protect, async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get total customers
    const totalCustomers = await Customer.countDocuments({ 
      assignedTo: req.user.id, 
      createdAt: { $gte: startDate, $lte: endDate } 
    });
    
    // Get customers by industry
    const customersByIndustry = await Customer.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$industry", count: { $sum: 1 } } }
    ]);
    
    // Get total value of all deals associated with customers
    const customerDealsValue = await Deal.aggregate([
      { $match: { 
        assignedTo: req.user._id, 
        customerId: { $ne: null },
        createdAt: { $gte: startDate, $lte: endDate } 
      }},
      { $group: { _id: null, totalValue: { $sum: "$value" } } }
    ]);
    
    const totalDealValue = customerDealsValue.length > 0 ? customerDealsValue[0].totalValue : 0;
    
    // Get top customers by deal value
    const topCustomers = await Deal.aggregate([
      { $match: { 
        assignedTo: req.user._id, 
        customerId: { $ne: null },
        createdAt: { $gte: startDate, $lte: endDate } 
      }},
      { $group: { 
        _id: "$customerId", 
        totalValue: { $sum: "$value" },
        dealCount: { $sum: 1 }
      }},
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }},
      { $unwind: '$customer' },
      { $project: {
        _id: 1,
        name: '$customer.name',
        email: '$customer.email',
        totalValue: 1,
        dealCount: 1
      }}
    ]);
    
    // Get new customers in current period
    const newCustomers = await Customer.countDocuments({
      assignedTo: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get active customers (customers with deals in the last 90 days)
    const activeThreshold = new Date();
    activeThreshold.setDate(activeThreshold.getDate() - 90);
    const activeCustomers = await Customer.countDocuments({
      assignedTo: req.user.id,
      lastActivityAt: { $gte: activeThreshold }
    });
    
    // Get churned customers (no activity in the last 180 days but had activity before)
    const churnThreshold = new Date();
    churnThreshold.setDate(churnThreshold.getDate() - 180);
    const churnedCustomers = await Customer.countDocuments({
      assignedTo: req.user.id,
      lastActivityAt: { $lt: churnThreshold },
      createdAt: { $lt: churnThreshold }
    });

    res.json({
      total: totalCustomers,
      new: newCustomers,
      active: activeCustomers,
      churned: churnedCustomers,
      totalDealValue,
      byIndustry: customersByIndustry,
      topCustomers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/deals
// @desc    Get deals report
// @access  Private
router.get('/deals', protect, async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get total deals
    const totalDeals = await Deal.countDocuments({ 
      assignedTo: req.user.id, 
      createdAt: { $gte: startDate, $lte: endDate } 
    });
    
    // Get deals by stage
    const dealsByStage = await Deal.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$stage", count: { $sum: 1 } } }
    ]);
    
    // Get deals by status
    const dealsByStatus = await Deal.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get total deal value
    const dealValueResult = await Deal.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalValue: { $sum: "$value" } } }
    ]);
    
    const totalDealValue = dealValueResult.length > 0 ? dealValueResult[0].totalValue : 0;
    
    // Get won deals value
    const wonDealsResult = await Deal.aggregate([
      { $match: { 
        assignedTo: req.user._id, 
        stage: 'closed-won',
        createdAt: { $gte: startDate, $lte: endDate } 
      }},
      { $group: { _id: null, totalValue: { $sum: "$value" }, count: { $sum: 1 } } }
    ]);
    
    const wonDealsValue = wonDealsResult.length > 0 ? wonDealsResult[0].totalValue : 0;
    const wonDealsCount = wonDealsResult.length > 0 ? wonDealsResult[0].count : 0;
    
    // Get average deal size
    const avgDealSize = totalDeals > 0 ? totalDealValue / totalDeals : 0;
    
    // Get conversion rate (closed-won / total)
    const conversionRate = totalDeals > 0 ? Math.round((wonDealsCount / totalDeals) * 100) : 0;
    
    // Get lost deals
    const lostDealsResult = await Deal.aggregate([
      { $match: {
        assignedTo: req.user._id,
        stage: 'closed-lost',
        createdAt: { $gte: startDate, $lte: endDate }
      }},
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    
    const lostDealsCount = lostDealsResult.length > 0 ? lostDealsResult[0].count : 0;

    res.json({
      total: totalDeals,
      totalValue: totalDealValue,
      averageDealSize: avgDealSize,
      won: wonDealsCount,
      lost: lostDealsCount,
      winRate: conversionRate,
      byStage: dealsByStage,
      byStatus: dealsByStatus
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/tasks
// @desc    Get tasks report
// @access  Private
router.get('/tasks', protect, async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;
    const { startDate, endDate } = getDateRange(dateRange);
    
    // Get total tasks
    const totalTasks = await Task.countDocuments({ 
      assignedTo: req.user.id, 
      createdAt: { $gte: startDate, $lte: endDate } 
    });
    
    // Get tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { assignedTo: req.user._id, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    
    // Get completed tasks
    const completedTasks = await Task.countDocuments({ 
      assignedTo: req.user.id, 
      status: 'completed',
      completedAt: { $gte: startDate, $lte: endDate } 
    });
    
    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({ 
      assignedTo: req.user.id, 
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() } 
    });
    
    // Get completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Get average completion time (in days)
    const avgCompletionTimeResult = await Task.aggregate([
      { $match: { 
        assignedTo: req.user._id, 
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate } 
      }},
      { $project: {
        completionTime: {
          $divide: [
            { $subtract: ["$completedAt", "$createdAt"] },
            1000 * 60 * 60 * 24 // Convert milliseconds to days
          ]
        }
      }},
      { $group: { 
        _id: null, 
        avgCompletionTime: { $avg: "$completionTime" } 
      }}
    ]);
    
    const avgCompletionTime = avgCompletionTimeResult.length > 0 
      ? Math.round(avgCompletionTimeResult[0].avgCompletionTime * 10) / 10 
      : 0;
    
    // Get pending tasks
    const pendingTasks = await Task.countDocuments({
      assignedTo: req.user.id,
      status: 'pending',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    res.json({
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      overdue: overdueTasks,
      completionRate,
      avgCompletionTime,
      byStatus: tasksByStatus,
      byPriority: tasksByPriority
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
