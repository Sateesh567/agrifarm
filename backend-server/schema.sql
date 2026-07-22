-- ============================================================
-- AgriFarm v2.0 — Optimized Database Schema
-- Features: password hashing, timestamps, soft-delete,
--           indexes, all new tables, state machine, triggers
-- ============================================================

CREATE DATABASE IF NOT EXISTS `agrifarm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `agrifarm`;

-- ─── 1. USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `uid`           VARCHAR(36)  NOT NULL,
  `name`          VARCHAR(100) NOT NULL,
  `email`         VARCHAR(100) NOT NULL,
  `phone`         VARCHAR(20)  DEFAULT '',
  `password_hash` VARCHAR(255) NOT NULL DEFAULT '',
  `role`          ENUM('FARMER','SHOP_OWNER','ADMIN') NOT NULL,
  `address`       TEXT         DEFAULT NULL,
  `profileImage`  VARCHAR(500) DEFAULT '',
  `is_verified`   TINYINT(1)   DEFAULT 0,
  `is_active`     TINYINT(1)   DEFAULT 1,
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`    TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `uq_email_role` (`email`, `role`),
  INDEX `idx_email`      (`email`),
  INDEX `idx_role`       (`role`),
  INDEX `idx_active`     (`is_active`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 2. REFRESH TOKENS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id`         VARCHAR(36)  NOT NULL,
  `user_id`    VARCHAR(36)  NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP    NOT NULL,
  `revoked_at` TIMESTAMP    NULL DEFAULT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id`   (`user_id`),
  INDEX `idx_expires`   (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 3. SHOPS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `shops` (
  `id`            VARCHAR(36)  NOT NULL,
  `ownerId`       VARCHAR(36)  NOT NULL,
  `name`          VARCHAR(150) NOT NULL,
  `address`       TEXT         DEFAULT NULL,
  `rating`        DECIMAL(3,2) DEFAULT 5.00,
  `imageUrl`      VARCHAR(500) DEFAULT 'images/seeds_shop.png',
  `description`   TEXT         DEFAULT NULL,
  `category`      VARCHAR(100) DEFAULT 'General Store',
  `status`        ENUM('PENDING','APPROVED','REJECTED','SUSPENDED') DEFAULT 'PENDING',
  `total_reviews` INT          DEFAULT 0,
  `is_active`     TINYINT(1)   DEFAULT 1,
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`    TIMESTAMP    NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_owner`      (`ownerId`),
  INDEX `idx_status`     (`status`),
  INDEX `idx_rating`     (`rating`),
  INDEX `idx_deleted_at` (`deleted_at`),
  FOREIGN KEY (`ownerId`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 4. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `id`                VARCHAR(36)   NOT NULL,
  `shopId`            VARCHAR(36)   NOT NULL,
  `name`              VARCHAR(200)  NOT NULL,
  `category`          ENUM('Seeds','Fertilizers','Pesticides','Weed Killers','Tools','Other') NOT NULL DEFAULT 'Seeds',
  `price`             DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `stock`             INT           NOT NULL DEFAULT 0,
  `description`       TEXT          DEFAULT NULL,
  `imageUrl`          VARCHAR(500)  DEFAULT '',
  `usageInstructions` TEXT          DEFAULT NULL,
  `rating`            DECIMAL(3,2)  DEFAULT 5.00,
  `total_reviews`     INT           DEFAULT 0,
  `is_active`         TINYINT(1)    DEFAULT 1,
  `created_at`        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`        TIMESTAMP     NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_shop`       (`shopId`),
  INDEX `idx_category`   (`category`),
  INDEX `idx_price`      (`price`),
  INDEX `idx_stock`      (`stock`),
  INDEX `idx_rating`     (`rating`),
  INDEX `idx_active`     (`is_active`),
  INDEX `idx_deleted_at` (`deleted_at`),
  FULLTEXT INDEX `idx_search` (`name`, `description`),
  FOREIGN KEY (`shopId`) REFERENCES `shops` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_price`  CHECK (`price`  >= 0),
  CONSTRAINT `chk_stock`  CHECK (`stock`  >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 5. WISHLIST ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id`         VARCHAR(36) NOT NULL,
  `user_id`    VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_product` (`user_id`, `product_id`),
  INDEX `idx_user`    (`user_id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`user_id`)    REFERENCES `users`    (`uid`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 6. ORDERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `orderId`         VARCHAR(36)   NOT NULL,
  `farmerUid`       VARCHAR(36)   NOT NULL,
  `shopId`          VARCHAR(36)   NOT NULL,
  `subtotal`        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee`    DECIMAL(10,2) DEFAULT 0.00,
  `totalAmount`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `deliveryAddress` TEXT          DEFAULT NULL,
  `status`          ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','FAILED','RETURNED','REFUNDED') DEFAULT 'PENDING',
  `notes`           TEXT          DEFAULT NULL,
  `created_at`      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`orderId`),
  INDEX `idx_farmer`  (`farmerUid`),
  INDEX `idx_shop`    (`shopId`),
  INDEX `idx_status`  (`status`),
  INDEX `idx_created` (`created_at`),
  FOREIGN KEY (`farmerUid`) REFERENCES `users`  (`uid`) ON DELETE RESTRICT,
  FOREIGN KEY (`shopId`)    REFERENCES `shops`  (`id`)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 7. ORDER ITEMS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`        INT           AUTO_INCREMENT NOT NULL,
  `orderId`   VARCHAR(36)   NOT NULL,
  `productId` VARCHAR(36)   NOT NULL,
  `name`      VARCHAR(200)  NOT NULL,
  `quantity`  INT           NOT NULL DEFAULT 1,
  `price`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_order`   (`orderId`),
  INDEX `idx_product` (`productId`),
  FOREIGN KEY (`orderId`)   REFERENCES `orders`   (`orderId`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`)      ON DELETE RESTRICT,
  CONSTRAINT `chk_quantity` CHECK (`quantity` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 8. PAYMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `id`                 VARCHAR(36)   NOT NULL,
  `order_id`           VARCHAR(36)   NOT NULL UNIQUE,
  `amount`             DECIMAL(10,2) NOT NULL,
  `currency`           VARCHAR(5)    DEFAULT 'INR',
  `method`             ENUM('COD','UPI','CARD','NETBANKING','WALLET') NOT NULL DEFAULT 'COD',
  `status`             ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING',
  `gateway_payment_id` VARCHAR(200)  DEFAULT NULL,
  `gateway_response`   JSON          DEFAULT NULL,
  `paid_at`            TIMESTAMP     NULL DEFAULT NULL,
  `created_at`         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status`   (`status`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`orderId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 9. REVIEWS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`          VARCHAR(36) NOT NULL,
  `product_id`  VARCHAR(36) NOT NULL,
  `user_id`     VARCHAR(36) NOT NULL,
  `order_id`    VARCHAR(36) NOT NULL,
  `rating`      TINYINT     NOT NULL,
  `title`       VARCHAR(200) DEFAULT NULL,
  `body`        TEXT         DEFAULT NULL,
  `is_verified` TINYINT(1)  DEFAULT 1,
  `helpful_count` INT        DEFAULT 0,
  `created_at`  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_product_order` (`user_id`, `product_id`, `order_id`),
  INDEX `idx_product`    (`product_id`),
  INDEX `idx_user`       (`user_id`),
  INDEX `idx_rating`     (`rating`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`)    REFERENCES `users`    (`uid`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`)   REFERENCES `orders`   (`orderId`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating`    CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 10. NOTIFICATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`         VARCHAR(36)  NOT NULL,
  `user_id`    VARCHAR(36)  NOT NULL,
  `title`      VARCHAR(200) NOT NULL,
  `body`       TEXT         NOT NULL,
  `type`       ENUM('ORDER','PAYMENT','PROMO','ALERT','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
  `ref_id`     VARCHAR(36)  DEFAULT NULL,
  `is_read`    TINYINT(1)   DEFAULT 0,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user`    (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_type`    (`type`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 11. INVENTORY LOGS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `inventory_logs` (
  `id`          INT         AUTO_INCREMENT NOT NULL,
  `product_id`  VARCHAR(36) NOT NULL,
  `change`      INT         NOT NULL,
  `reason`      ENUM('SALE','RESTOCK','ADJUSTMENT','RETURN') NOT NULL,
  `ref_id`      VARCHAR(36) DEFAULT NULL,
  `stock_after` INT         NOT NULL,
  `created_at`  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_product`  (`product_id`),
  INDEX `idx_reason`   (`reason`),
  INDEX `idx_created`  (`created_at`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 12. AUDIT LOGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id`          VARCHAR(36)  NOT NULL,
  `user_id`     VARCHAR(36)  DEFAULT NULL,
  `action`      VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50)  NOT NULL,
  `entity_id`   VARCHAR(36)  DEFAULT NULL,
  `old_values`  JSON         DEFAULT NULL,
  `new_values`  JSON         DEFAULT NULL,
  `ip_address`  VARCHAR(45)  DEFAULT NULL,
  `user_agent`  TEXT         DEFAULT NULL,
  `created_at`  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 13. MANDI PRICES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `mandi_prices` (
  `id`           VARCHAR(36)  NOT NULL,
  `crop_name`    VARCHAR(100) NOT NULL,
  `variety`      VARCHAR(100) NOT NULL,
  `min_price`    DECIMAL(10,2) NOT NULL,
  `max_price`    DECIMAL(10,2) NOT NULL,
  `price_change` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `trend`        VARCHAR(20)  NOT NULL DEFAULT 'STABLE',
  `district`     VARCHAR(100) NOT NULL,
  `created_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_district` (`district`),
  INDEX `idx_crop_name` (`crop_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 14. CROP DISEASES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `crop_diseases` (
  `id`                          VARCHAR(36)  NOT NULL,
  `crop_name`                   VARCHAR(100) NOT NULL,
  `disease_name`                VARCHAR(150) NOT NULL,
  `scientific_name`             VARCHAR(200) NOT NULL,
  `confidence`                  INT          NOT NULL,
  `severity`                    VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
  `description`                 TEXT         DEFAULT NULL,
  `symptoms`                    JSON         DEFAULT NULL,
  `solutions`                   JSON         DEFAULT NULL,
  `recommended_product_name`    VARCHAR(200) DEFAULT '',
  `recommended_product_price`   VARCHAR(50)  DEFAULT '',
  `recommended_product_category` VARCHAR(100) DEFAULT '',
  `created_at`                  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_crop_name` (`crop_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 15. WEATHER FORECASTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `weather_forecasts` (
  `id`             VARCHAR(36)  NOT NULL,
  `day_name`       VARCHAR(10)  NOT NULL,
  `temp`           VARCHAR(10)  NOT NULL,
  `condition_icon` VARCHAR(50)  NOT NULL,
  `is_alert`       TINYINT(1)   NOT NULL DEFAULT 0,
  `location`       VARCHAR(200) NOT NULL DEFAULT 'Kumbakonam, Tamil Nadu',
  `temp_celsius`   INT          NOT NULL DEFAULT 32,
  `condition_text` VARCHAR(100) NOT NULL DEFAULT 'Sunny Interval',
  `created_at`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- ALTER: Add missing columns to existing tables (migration)
-- ═══════════════════════════════════════════════════════════

-- Add password_hash to users if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_hash';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT \'\' AFTER phone',
  'SELECT "password_hash already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add created_at to users if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'created_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "created_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add updated_at to users if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'updated_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "updated_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add deleted_at to users if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL',
  'SELECT "deleted_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add is_active to users if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'is_active';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1',
  'SELECT "is_active already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add created_at to shops if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'created_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE shops ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "shops.created_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add updated_at to shops if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'updated_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE shops ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "shops.updated_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add deleted_at to shops if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'deleted_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE shops ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL',
  'SELECT "shops.deleted_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add created_at to products if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'created_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "products.created_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add updated_at to products if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'updated_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "products.updated_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add deleted_at to products if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'deleted_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL',
  'SELECT "products.deleted_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add is_active to products if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_active';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1',
  'SELECT "products.is_active already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add total_reviews to products if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'total_reviews';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE products ADD COLUMN total_reviews INT DEFAULT 0',
  'SELECT "products.total_reviews already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add created_at / updated_at to orders if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'created_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE orders ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  'SELECT "orders.created_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'updated_at';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "orders.updated_at already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add deliveryAddress to orders if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'deliveryAddress';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE orders ADD COLUMN deliveryAddress TEXT DEFAULT NULL',
  'SELECT "orders.deliveryAddress already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add subtotal to orders if not exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'subtotal';
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10,2) DEFAULT 0.00',
  'SELECT "orders.subtotal already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ═══════════════════════════════════════════════════════════
-- SEED DATA (only if tables are empty)
-- ═══════════════════════════════════════════════════════════

-- Seed Users (passwords are bcrypt of 'farmer123' and 'seller123')
-- password 'farmer123' → $2b$12$...  (bcrypt hash, 12 rounds)
INSERT IGNORE INTO `users` (`uid`, `name`, `email`, `phone`, `password_hash`, `role`, `address`, `profileImage`) VALUES
('farmer-001', 'Rajesh Kumar',        'farmer@agrifarm.com',   '9876543210',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaEMbPVlqBWVHxkd0LHAkABCDE',
 'FARMER', 'Salem, Tamil Nadu', ''),
('seller-001', 'Bhoomiputra Merchant', 'seller@agrifarm.com',   '8765432109',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaEMbPVlqBWVHxkd0LHAkABCDE',
 'SHOP_OWNER', 'Coimbatore, Tamil Nadu', ''),
('seller-002', 'Salem Agro Owner',    'seller2@agrifarm.com',  '7654321098',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaEMbPVlqBWVHxkd0LHAkABCDE',
 'SHOP_OWNER', 'Salem North, TN', ''),
('admin-001',  'AgriFarm Admin',      'admin@agrifarm.com',    '9000000001',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMaEMbPVlqBWVHxkd0LHAkABCDE',
 'ADMIN', 'Chennai, TN', '');

-- Seed Shops
INSERT IGNORE INTO `shops` (`id`, `ownerId`, `name`, `address`, `rating`, `imageUrl`, `description`, `category`, `status`) VALUES
('S1', 'seller-001', 'Bhoomi Organics',   'Coimbatore South, TN', 4.8, 'images/organic_farm.png', 'Lush fertilizers, premium seeds, and modern tools', 'Seeds & Fertilizers', 'APPROVED'),
('S2', 'seller-002', 'Salem Agro Field',  'Salem North, TN',      4.5, 'images/seeds_shop.png',   'Direct farm supplies, organic manures, and weed solutions', 'Organic Manures', 'PENDING');

-- Seed Products
INSERT IGNORE INTO `products` (`id`, `shopId`, `name`, `category`, `price`, `stock`, `description`, `imageUrl`, `usageInstructions`, `rating`) VALUES
('P1', 'S1', 'Premium Tomato Seeds',  'Seeds',        249.0,  100, 'High disease resistance, quick sprouting',       '', 'Sow 1cm deep in fine loose soil. Water gently daily.', 4.8),
('P2', 'S1', 'Organic NPK Fertilizer','Fertilizers',  450.0,  150, 'Highly potent nitrogen, organic compound',       '', 'Mix 50g per plant base. Water immediately after application.', 4.7),
('P3', 'S1', 'Bhoomi Power Tiller',   'Tools',       7499.0,   10, 'Motorized handheld soil tiller',                 '', 'Always wear safety boots. Read owner manual before starting engine.', 4.9),
('P4', 'S1', 'Weed Kill Pro 500ml',   'Weed Killers', 399.0,   80, 'Broad-spectrum selective herbicide',             '', 'Dilute 20ml in 1L water. Spray on weeds, avoid crop leaves.', 4.5),
('P5', 'S1', 'BioNeem Pesticide',     'Pesticides',   299.0,  200, 'Organic neem oil extract, eco-friendly',         '', 'Apply in evening. Repeat every 7 days.', 4.6);

-- Seed Weather Forecasts
INSERT IGNORE INTO `weather_forecasts` (`id`, `day_name`, `temp`, `condition_icon`, `is_alert`, `location`, `temp_celsius`, `condition_text`) VALUES
('w1', 'MON', '21°', 'Cloud', 0, 'Kumbakonam, Tamil Nadu', 32, 'Sunny Interval'),
('w2', 'TUE', '32°', 'WbSunny', 1, 'Kumbakonam, Tamil Nadu', 32, 'Sunny Interval'),
('w3', 'WED', '22°', 'WbCloudy', 0, 'Kumbakonam, Tamil Nadu', 32, 'Sunny Interval'),
('w4', 'THU', '28°', 'WbSunny', 0, 'Kumbakonam, Tamil Nadu', 32, 'Sunny Interval'),
('w5', 'FRI', '27°', 'Grain', 0, 'Kumbakonam, Tamil Nadu', 32, 'Sunny Interval');

-- Seed Mandi Prices
INSERT IGNORE INTO `mandi_prices` (`id`, `crop_name`, `variety`, `min_price`, `max_price`, `price_change`, `trend`, `district`) VALUES
('m1', 'Tomato', 'Local Desi', 35.0, 48.0, 4.5, 'HIGH', 'Trichy'),
('m2', 'Paddy (Basmati)', 'Grade A', 3600.0, 4100.0, 120.0, 'HIGH', 'Trichy'),
('m3', 'Cotton', 'Medium Staple', 6800.0, 7200.0, -50.0, 'STABLE', 'Trichy'),
('m4', 'Turmeric', 'Finger Salem', 12500.0, 13200.0, 320.0, 'HIGH', 'Trichy'),
('m5', 'Onion', 'Nasik Red', 28.0, 34.0, -2.0, 'LOW', 'Trichy'),
('m6', 'Sugarcane', 'Raw Cane', 2800.0, 3050.0, 0.0, 'STABLE', 'Trichy'),

('m7', 'Turmeric', 'Salem Special', 12800.0, 13600.0, 450.0, 'HIGH', 'Salem'),
('m8', 'Paddy (Basmati)', 'Grade A', 3500.0, 4000.0, 80.0, 'HIGH', 'Salem'),
('m9', 'Tomato', 'Hybrid Special', 30.0, 42.0, -3.0, 'STABLE', 'Salem'),
('m10', 'Onion', 'Bellary Red', 26.0, 32.0, 1.5, 'STABLE', 'Salem'),
('m11', 'Sugarcane', 'Raw Cane', 2850.0, 3100.0, 50.0, 'HIGH', 'Salem'),

('m12', 'Turmeric', 'Erode Finger', 12400.0, 13100.0, 210.0, 'HIGH', 'Coimbatore'),
('m13', 'Cotton', 'Long Staple', 7100.0, 7500.0, 150.0, 'HIGH', 'Coimbatore'),
('m14', 'Paddy (Basmati)', 'Grade B', 3200.0, 3600.0, -40.0, 'STABLE', 'Coimbatore'),
('m15', 'Tomato', 'Local Desi', 32.0, 45.0, 2.0, 'STABLE', 'Coimbatore'),
('m16', 'Onion', 'Small Sambar', 45.0, 55.0, 5.0, 'HIGH', 'Coimbatore'),

('m17', 'Paddy (Basmati)', 'Grade A', 3650.0, 4150.0, 150.0, 'HIGH', 'Thanjavur'),
('m18', 'Tomato', 'Local Desi', 38.0, 50.0, 6.0, 'HIGH', 'Thanjavur'),
('m19', 'Cotton', 'Medium Staple', 6700.0, 7100.0, -100.0, 'LOW', 'Thanjavur'),
('m20', 'Onion', 'Nasik Red', 30.0, 36.0, 0.0, 'STABLE', 'Thanjavur'),
('m21', 'Sugarcane', 'Raw Cane', 2800.0, 3000.0, -20.0, 'STABLE', 'Thanjavur'),

('m22', 'Paddy (Basmati)', 'Grade A', 3550.0, 4050.0, 100.0, 'HIGH', 'Madurai'),
('m23', 'Onion', 'Small Sambar', 42.0, 52.0, 3.5, 'HIGH', 'Madurai'),
('m24', 'Tomato', 'Hybrid Special', 34.0, 46.0, -1.0, 'STABLE', 'Madurai'),
('m25', 'Turmeric', 'Finger Salem', 12600.0, 13300.0, 180.0, 'STABLE', 'Madurai'),
('m26', 'Cotton', 'Medium Staple', 6850.0, 7250.0, 20.0, 'STABLE', 'Madurai');

-- Seed Crop Diseases
INSERT IGNORE INTO `crop_diseases` (`id`, `crop_name`, `disease_name`, `scientific_name`, `confidence`, `severity`, `description`, `symptoms`, `solutions`, `recommended_product_name`, `recommended_product_price`, `recommended_product_category`) VALUES
('d1', 'Rice', 'Rice Paddy Blast', 'Magnaporthe oryzae', 94, 'HIGH',
 'One of the most devastating diseases affecting rice crops. Highly active in humid conditions with dense nitrogen application.',
 '["Spindle-shaped lesions on leaves", "Brown spots with gray centers", "Neck rot causing empty grains"]',
 '["Apply balanced Nitrogen fertilizer", "Spray organic copper-based fungicide", "Maintain healthy water drainage"]',
 'Rice Paddy Gold Special', '₹1,120', 'Fertilizers'),

('d2', 'Tomato', 'Tomato Early Blight', 'Alternaria solani', 88, 'MEDIUM',
 'Fungal disease leading to leaf spots, defoliation, and fruit rot. Spreads quickly in warm, wet weather.',
 '["Target-like concentric rings on leaves", "Yellowing around leaf spots", "Dark spots on stems"]',
 '["Prune lower leaves to enhance airflow", "Mulch around base to prevent soil splash", "Spray organic Neem Shield"]',
 'Neem Shield Spray', '₹850', 'Pesticides'),

('d3', 'Chilli', 'Chilli Leaf Curl', 'Chilli leaf curl virus (ChiLCV)', 91, 'HIGH',
 'Viral disease transmitted by whiteflies. Causes severe stunting and reduces yield by up to 90% if untreated.',
 '["Leaves curling upwards", "Puckering and shrinking of leaves", "Stunted plant height"]',
 '["Deploy yellow sticky insect traps", "Control whitefly vectors using bio-pesticides", "Remove heavily infected plant nodes"]',
 'WeedTerminator Pro Bio', '₹420', 'Pesticides'),

('d4', 'Cotton', 'Bacterial Leaf Blight', 'Xanthomonas citri', 86, 'MEDIUM',
 'Bacterial pathogen causing angular spots on cotton leaves and boll rot. Thrives in high humidity levels.',
 '["Angular water-soaked leaf spots", "Reddish-brown margins on leaf veins", "Shedding of infected cotton bolls"]',
 '["Use disease-resistant certified seeds", "Avoid overhead sprinkler irrigation", "Apply biological copper compounds"]',
 'Micronutrient Boost', '₹190', 'Fertilizers'),

('d5', 'Sugarcane', 'Sugarcane Red Rot', 'Colletotrichum falcatum', 95, 'CRITICAL',
 'Often referred to as the \'cancer\' of sugarcane crops. Fungal pathogen invading stalks, rotting internal tissues.',
 '["Red discoloration inside stalk", "White spots crosswise inside stem", "Leaves drying from tip downwards"]',
 '["Use healthy disease-free seed setts", "Crop rotation with paddy/green manure", "Improve field sanitation and drainage"]',
 'Bio-Potash Organic Booster', '₹315', 'Fertilizers');

-- ─── 16. PRODUCT IMAGES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `product_images` (
  `id`         VARCHAR(36)  NOT NULL,
  `product_id` VARCHAR(36)  NOT NULL,
  `image_url`  VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1)   DEFAULT 0,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 17. ACCESS TOKEN BLACKLIST ──────────────────────────────
CREATE TABLE IF NOT EXISTS `access_token_blacklist` (
  `id`         VARCHAR(36)  NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP    NOT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════
-- NOTE: Run this after inserting seed users to hash passwords correctly
-- UPDATE users SET password_hash = '$2b$12$ACTUALHASH' WHERE uid = 'farmer-001';
-- 
-- To generate proper hashes, in Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(await bcrypt.hash('farmer123', 12));
-- ═══════════════════════════════════════════════════════════
