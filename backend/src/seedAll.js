const { execSync } = require('child_process');

console.log('Seeding all data...');

try {
  // Run seed script to create user and company
  console.log('1. Creating user and company...');
  execSync('node src/seed.js', { stdio: 'inherit' });

  // Run seed customers script
  console.log('\n2. Creating customers...');
  execSync('node src/seedCustomers.js', { stdio: 'inherit' });

  // Run seed deals script
  console.log('\n3. Creating deals...');
  execSync('node src/seedDeals.js', { stdio: 'inherit' });

  console.log('\nAll data seeded successfully!');
} catch (error) {
  console.error('Error seeding data:', error.message);
  process.exit(1);
}
