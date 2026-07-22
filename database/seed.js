// Seed script: creates admin user + seed data with proper bcrypt hashes
const bcrypt = require('bcryptjs');
const pool = require('../backend-server/src/config/database');

async function seed() {
  try {
    console.log('Generating password hashes...');
    const adminHash   = await bcrypt.hash('admin123', 12);
    const farmerHash  = await bcrypt.hash('farmer123', 12);
    const sellerHash  = await bcrypt.hash('seller123', 12);

    console.log('Clearing old seed data...');
    await pool.execute("DELETE FROM products WHERE id IN ('P1', 'P2', 'P3', 'P4', 'P5')").catch(() => {});
    await pool.execute("DELETE FROM shops WHERE id IN ('S1', 'S2')").catch(() => {});
    await pool.execute("DELETE FROM users WHERE email IN ('admin@agrifarm.com', 'farmer@agrifarm.com', 'seller@agrifarm.com', 'seller2@agrifarm.com')").catch(() => {});

    console.log('Seeding users...');
    await pool.execute(`INSERT INTO users (uid, name, email, phone, password_hash, role, address, profileImage)
      VALUES 
        ('admin-001', 'AgriFarm Admin', 'admin@agrifarm.com', '9000000001', ?, 'ADMIN', 'Chennai, TN', ''),
        ('farmer-001', 'Rajesh Kumar', 'farmer@agrifarm.com', '9876543210', ?, 'FARMER', 'Salem, Tamil Nadu', ''),
        ('seller-001', 'Bhoomiputra Merchant', 'seller@agrifarm.com', '8765432109', ?, 'SHOP_OWNER', 'Coimbatore, Tamil Nadu', ''),
        ('seller-002', 'Salem Agro Owner', 'seller2@agrifarm.com', '7654321098', ?, 'SHOP_OWNER', 'Salem North, TN', '')
    `, [adminHash, farmerHash, sellerHash, sellerHash]);

    console.log('Seeding shops...');
    await pool.execute(`INSERT INTO shops (id, ownerId, name, address, rating, imageUrl, description, category, status) VALUES 
      ('S1', 'seller-001', 'Bhoomi Organics', 'Coimbatore South, TN', 4.8, 'images/organic_farm.png', 'Lush fertilizers, premium seeds, and modern tools', 'Seeds & Fertilizers', 'APPROVED'),
      ('S2', 'seller-002', 'Salem Agro Field', 'Salem North, TN', 4.5, 'images/seeds_shop.png', 'Direct farm supplies, organic manures, and weed solutions', 'Organic Manures', 'PENDING')
    `);

    console.log('Seeding products...');
    await pool.execute(`INSERT INTO products (id, shopId, name, category, price, stock, description, imageUrl, usageInstructions, rating) VALUES 
      ('P1', 'S1', 'Premium Tomato Seeds', 'Seeds', 249.0, 100, 'High disease resistance, quick sprouting', '', 'Sow 1cm deep in fine loose soil. Water gently daily.', 4.8),
      ('P2', 'S1', 'Organic NPK Fertilizer', 'Fertilizers', 450.0, 150, 'Highly potent nitrogen, organic compound', '', 'Mix 50g per plant base. Water immediately after application.', 4.7),
      ('P3', 'S1', 'Bhoomi Power Tiller', 'Tools', 7499.0, 10, 'Motorized handheld soil tiller', '', 'Always wear safety boots. Read owner manual before starting engine.', 4.9),
      ('P4', 'S1', 'Weed Kill Pro 500ml', 'Weed Killers', 399.0, 80, 'Broad-spectrum selective herbicide', '', 'Dilute 20ml in 1L water. Spray on weeds, avoid crop leaves.', 4.5),
      ('P5', 'S1', 'BioNeem Pesticide', 'Pesticides', 299.0, 200, 'Organic neem oil extract, eco-friendly', '', 'Apply in evening. Repeat every 7 days.', 4.6)
    `);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
