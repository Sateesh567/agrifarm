const pool = require('./src/config/database');

async function run() {
  try {
    // Check if qrCodeUrl already exists
    const [columns] = await pool.query("SHOW COLUMNS FROM shops LIKE 'qrCodeUrl'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE shops ADD COLUMN qrCodeUrl VARCHAR(500) DEFAULT '' AFTER imageUrl");
      console.log("Column qrCodeUrl successfully added to shops table!");
    } else {
      console.log("Column qrCodeUrl already exists in shops table.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
