const fs = require('fs');
const path = require('path');

// Load all models
const models = {};
const modelsPath = path.join(__dirname);

// Load models in specific order to handle dependencies
const modelFiles = [
  'Company.js',
  'User.js',
  'Lead.js',
  'Customer.js',
  'Deal.js',
  'Task.js',
  'ActivityLog.js'
];

// Load each model file
modelFiles.forEach(file => {
  if (fs.existsSync(path.join(modelsPath, file))) {
    const modelName = path.basename(file, '.js');
    models[modelName] = require(path.join(modelsPath, file));
  }
});

// Also load any additional model files not in the specific list
fs.readdirSync(modelsPath)
  .filter(file => file !== 'index.js' && file.endsWith('.js') && !modelFiles.includes(file))
  .forEach(file => {
    const modelName = path.basename(file, '.js');
    models[modelName] = require(path.join(modelsPath, file));
  });

module.exports = models;
