const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
  stdTTL: 100, // Cache items for 100 seconds by default
  checkperiod: 120, // Check for expired keys every 120 seconds
  useClones: false,
  deleteOnExpire: true,
  enableLegacyCallbacks: false,
  maxKeys: 1000 // Maximum number of keys
});

// Get value from cache
const get = (key) => {
  return cache.get(key);
};

// Set value in cache
const set = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

// Delete value from cache
const del = (key) => {
  return cache.del(key);
};

// Clear all cache
const flush = () => {
  return cache.flushAll();
};

// Get cache statistics
const getStats = () => {
  return cache.getStats();
};

// Cache middleware for Express
const cacheMiddleware = (duration = 60) => {
  return (req, res, next) => {
    const key = req.originalUrl || req.url;
    const cachedContent = cache.get(key);

    if (cachedContent) {
      // Return cached content if available
      return res.json(cachedContent);
    }

    // Store response in cache
    res.locals.cacheResponse = (data) => {
      cache.set(key, data, duration);
      return res.json(data);
    };

    next();
  };
};

module.exports = {
  get,
  set,
  del,
  flush,
  getStats,
  cacheMiddleware
};
