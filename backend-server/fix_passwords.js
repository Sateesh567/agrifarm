// One-time script to set correct password hashes for seed users
// Run: node fix_passwords.js
const bcrypt = require('bcryptjs')
require('dotenv').config()
const mysql = require('mysql2/promise')

async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agrifarm',
  })

  const updates = [
    { uid: 'admin-001',  password: 'admin123'  },
    { uid: 'farmer-001', password: 'farmer123' },
    { uid: 'seller-001', password: 'seller123' },
    { uid: 'seller-002', password: 'seller123' },
  ]

  for (const u of updates) {
    const hash = await bcrypt.hash(u.password, 12)
    const [r] = await pool.execute('UPDATE users SET password_hash = ? WHERE uid = ?', [hash, u.uid])
    console.log(`✅ ${u.uid} → password="${u.password}" hash updated (${r.affectedRows} row)`)
  }

  // Also make sure blocked_at and blocked_reason columns exist
  try {
    await pool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP NULL DEFAULT NULL')
    await pool.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT DEFAULT NULL')
    console.log('✅ blocked_at and blocked_reason columns ensured')
  } catch(e) {
    console.log('ℹ️  Columns may already exist:', e.message)
  }

  // Ensure shop columns exist
  try {
    await pool.execute('ALTER TABLE shops ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL')
    await pool.execute('ALTER TABLE shops ADD COLUMN IF NOT EXISTS license_number VARCHAR(100) DEFAULT NULL')
    await pool.execute('ALTER TABLE shops ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL DEFAULT NULL')
    await pool.execute("ALTER TABLE shops ADD COLUMN IF NOT EXISTS plan ENUM('FREE','BASIC','PREMIUM') NOT NULL DEFAULT 'FREE'")
    await pool.execute('ALTER TABLE shops ADD COLUMN IF NOT EXISTS documents_uploaded TINYINT(1) DEFAULT 0')
    console.log('✅ Shop columns ensured')
  } catch(e) {
    console.log('ℹ️  Shop columns:', e.message)
  }

  const [users] = await pool.execute('SELECT uid, name, role, LENGTH(password_hash) as hash_len, is_active FROM users')
  console.log('\n📋 Current users:')
  users.forEach(u => console.log(`  ${u.uid} (${u.role}) hash_len=${u.hash_len} active=${u.is_active}`))

  await pool.end()
  console.log('\n✅ Done! Restart the backend server to apply changes.')
}

main().catch(console.error)
