-- ============================================================
-- AgriFarm v2.0 — Enterprise Database Schema (MariaDB / MySQL)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- ─── 11. AUDIT LOGS ──────────────────────────────────────────
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── 12. MANDI PRICES ─────────────────────────────────────────
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

-- ─── 13. CROP DISEASES ────────────────────────────────────────
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
