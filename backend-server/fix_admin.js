// Fix all user passwords with proper bcrypt hashes
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function fixPasswords() {
  const adminHash  = await bcrypt.hash('admin123', 12);
  const farmerHash = await bcrypt.hash('farmer123', 12);
  const sellerHash = await bcrypt.hash('seller123', 12);

  await pool.execute("UPDATE users SET password_hash = ? WHERE uid = 'admin-001'",  [adminHash]);
  await pool.execute("UPDATE users SET password_hash = ? WHERE uid = 'farmer-001'", [farmerHash]);
  await pool.execute("UPDATE users SET password_hash = ? WHERE uid = 'seller-001'", [sellerHash]);
  await pool.execute("UPDATE users SET password_hash = ? WHERE uid = 'seller-002'", [sellerHash]);

  console.log('✅ All passwords updated!');
  console.log('admin@agrifarm.com  → admin123');
  console.log('farmer@agrifarm.com → farmer123');
  console.log('seller@agrifarm.com → seller123');
  process.exit(0);
}

fixPasswords().catch(e => { console.error(e.message); process.exit(1); });
