const fs = require('fs');
const path = require('path');

// Load all models
const models = {};
const modelsPath = path.join(__dirname);

fs.readdirSync(modelsPath)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const modelName = path.basename(file, '.js');
    models[modelName] = require(path.join(modelsPath, file));
  });

module.exports = models;
