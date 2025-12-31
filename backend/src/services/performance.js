const os = require('os');
const process = require('process');

// Get system performance metrics
const getSystemMetrics = () => {
  return {
    // Memory usage
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      usagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100) / 100
    },

    // CPU usage
    cpu: {
      count: os.cpus().length,
      model: os.cpus()[0].model,
      speed: os.cpus()[0].speed
    },

    // System uptime
    uptime: {
      system: os.uptime(),
      process: process.uptime()
    },

    // Load average
    loadAverage: os.loadavg(),

    // Platform info
    platform: {
      os: os.type(),
      arch: os.arch(),
      nodeVersion: process.version
    }
  };
};

// Get database performance metrics
const getDatabaseMetrics = async () => {
  const mongoose = require('mongoose');

  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return { error: 'Database not connected' };
    }
    
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.serverStatus();
    const dbStats = await admin.command({ collStats: 1 });

    return {
      connections: {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        totalCreated: serverStatus.connections.totalCreated
      },

      operations: {
        queries: serverStatus.opcounters.query.total,
        inserts: serverStatus.opcounters.insert.total,
        updates: serverStatus.opcounters.update.total,
        deletes: serverStatus.opcounters.delete.total,
        getmore: serverStatus.opcounters.getmore.total
      },

      performance: {
        queryExecutionTime: serverStatus.metrics.queryExecutor.scannedObjects / serverStatus.opcounters.query.total,
        indexUsage: calculateIndexUsage(dbStats)
      }
    };
  } catch (error) {
    console.error('Error getting database metrics:', error);
    return null;
  }
};

// Calculate index usage efficiency
const calculateIndexUsage = (dbStats) => {
  if (!dbStats || !dbStats.collections) return 0;

  let totalIndexes = 0;
  let totalSize = 0;

  Object.values(dbStats.collections).forEach(collection => {
    if (collection.indexes) {
      totalIndexes += collection.indexes.length;
      totalSize += collection.size;
    }
  });

  return totalSize > 0 ? Math.round((totalIndexes / totalSize) * 100) / 100 : 0;
};

// Get application performance metrics
const getAppMetrics = () => {
  const used = process.memoryUsage();

  return {
    memory: {
      rss: Math.round(used.rss / 1024 / 1024), // MB
      heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
      external: Math.round(used.external / 1024 / 1024) // MB
    },

    cpu: process.cpuUsage(),

    uptime: process.uptime()
  };
};

// Log performance metrics
const logPerformanceMetrics = async () => {
  const systemMetrics = getSystemMetrics();
  const dbMetrics = await getDatabaseMetrics();
  const appMetrics = getAppMetrics();

  console.log('=== Performance Metrics ===');
  console.log('System:', JSON.stringify(systemMetrics, null, 2));
  console.log('Database:', JSON.stringify(dbMetrics, null, 2));
  console.log('Application:', JSON.stringify(appMetrics, null, 2));
  console.log('========================');

  return {
    timestamp: new Date(),
    system: systemMetrics,
    database: dbMetrics,
    application: appMetrics
  };
};

module.exports = {
  getSystemMetrics,
  getDatabaseMetrics,
  getAppMetrics,
  logPerformanceMetrics
};
