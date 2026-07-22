// cleanup_db.js
// Standing database cleanup script to wipe sample/test entries.
// Run: node cleanup_db.js

require('dotenv').config();
const pool = require('./src/config/database');

async function run() {
  console.log('🧹 Starting database cleanup...');
  let conn;
  try {
    conn = await pool.getConnection();

    // Disable foreign key checks for a clean purge
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // List of transactional tables to fully truncate
    const tablesToTruncate = [
      'wishlist',
      'order_items',
      'orders',
      'payments',
      'reviews',
      'notifications',
      'inventory_logs',
      'audit_logs',
      'refresh_tokens'
    ];

    for (const table of tablesToTruncate) {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
      console.log(`  🗑️ Truncated table: ${table}`);
    }

    // Delete all products and shops
    await conn.query('DELETE FROM products');
    console.log('  🗑️ Deleted all products');

    await conn.query('DELETE FROM shops');
    console.log('  🗑️ Deleted all shops');

    // Delete all user records except for the default ADMIN account
    await conn.query("DELETE FROM users WHERE role != 'ADMIN'");
    console.log('  🗑️ Deleted all users except Admin');

    // Re-enable foreign key constraints
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database cleanup completed successfully!');
  } catch (err) {
    console.error('❌ Database cleanup failed:', err.message);
  } finally {
    if (conn) conn.release();
    process.exit(0);
  }
}

run();
