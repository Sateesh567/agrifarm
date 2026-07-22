const jwt = require('jsonwebtoken');
const { exec } = require('child_process');

const ACCESS_SECRET = 'agrifarm_access_secret_2024_change_in_production_xyz789';

const payload = {
  id: 'admin-001',
  email: 'admin@agrifarm.com',
  role: 'ADMIN',
  name: 'AgriFarm Admin'
};

const token = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
const url = `http://localhost:5173/?token=${token}`;

console.log(`Generated Admin Token: ${token}`);
console.log(`Opening URL: ${url}`);

// Open in default browser
exec(`start "" "${url}"`);
