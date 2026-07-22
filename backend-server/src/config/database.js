// src/config/database.js
// MySQL connection pool — all credentials from .env, never hardcoded

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:             process.env.DB_HOST || 'localhost',
  user:             process.env.DB_USER || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME || 'agrifarm',
  waitForConnections: true,
  connectionLimit:  parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit:       0,
  enableKeepAlive:  true,
  keepAliveInitialDelay: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected successfully to XAMPP server!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Fatal: Could not connect to MySQL database.');
    console.error('   Make sure XAMPP / MySQL is running!');
    console.error('  ', err.message);
  });

module.exports = pool;
