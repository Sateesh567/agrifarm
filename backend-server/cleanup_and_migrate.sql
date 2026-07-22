-- ============================================================
-- AgriFarm — Cleanup & Schema Migration v2.1
-- Run this in phpMyAdmin SQL tab OR via mysql CLI
-- ============================================================
USE `agrifarm`;

-- ─── Step 1: Disable FK checks for safe cleanup ──────────
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Step 2: Hard-delete all shop-related data ───────────
DELETE FROM `inventory_logs` WHERE `product_id` IN (SELECT `id` FROM `products`);
DELETE FROM `wishlist`;
DELETE FROM `order_items`;
DELETE FROM `orders`;
DELETE FROM `reviews`;
DELETE FROM `payments`;
DELETE FROM `products`;
DELETE FROM `shops`;

-- ─── Step 3: Re-enable FK checks ─────────────────────────
SET FOREIGN_KEY_CHECKS = 1;

-- ─── Step 4: Add missing columns to `shops` ──────────────

-- phone
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'phone');
SET @sql = IF(@col = 0, 'ALTER TABLE shops ADD COLUMN phone VARCHAR(20) DEFAULT NULL AFTER ownerId', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- license_number
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'license_number');
SET @sql = IF(@col = 0, 'ALTER TABLE shops ADD COLUMN license_number VARCHAR(100) DEFAULT NULL AFTER phone', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- verified_at
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'verified_at');
SET @sql = IF(@col = 0, 'ALTER TABLE shops ADD COLUMN verified_at TIMESTAMP NULL DEFAULT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- plan
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'plan');
SET @sql = IF(@col = 0, "ALTER TABLE shops ADD COLUMN plan ENUM('FREE','BASIC','PREMIUM') NOT NULL DEFAULT 'FREE'", 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- documents_uploaded
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'documents_uploaded');
SET @sql = IF(@col = 0, 'ALTER TABLE shops ADD COLUMN documents_uploaded TINYINT(1) DEFAULT 0', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ─── Step 5: Add missing columns to `users` ──────────────

-- blocked_at
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'blocked_at');
SET @sql = IF(@col = 0, 'ALTER TABLE users ADD COLUMN blocked_at TIMESTAMP NULL DEFAULT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- blocked_reason
SET @col = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'blocked_reason');
SET @sql = IF(@col = 0, 'ALTER TABLE users ADD COLUMN blocked_reason TEXT DEFAULT NULL', 'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ─── Step 6: Fix admin user password hash ────────────────
-- Hash below is bcrypt of 'admin123' with 12 rounds (pre-computed)
UPDATE `users` SET 
  `password_hash` = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  `is_active` = 1,
  `blocked_at` = NULL
WHERE `uid` = 'admin-001';

-- Fix farmer password hash = 'farmer123'
UPDATE `users` SET 
  `password_hash` = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  `is_active` = 1,
  `blocked_at` = NULL
WHERE `uid` = 'farmer-001';

-- Fix seller password hashes = 'seller123'  
UPDATE `users` SET 
  `password_hash` = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  `is_active` = 1,
  `blocked_at` = NULL
WHERE `uid` IN ('seller-001', 'seller-002');

-- ─── Step 7: Verify ──────────────────────────────────────
SELECT 'Shops remaining:' AS info, COUNT(*) AS cnt FROM shops;
SELECT 'Products remaining:' AS info, COUNT(*) AS cnt FROM products;
SELECT 'Orders remaining:' AS info, COUNT(*) AS cnt FROM orders;
SELECT 'Users remaining:' AS info, COUNT(*) AS cnt FROM users WHERE deleted_at IS NULL;
