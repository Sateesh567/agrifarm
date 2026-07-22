-- Fix missing FK-dependent tables for AgriFarm
-- All tables use same collation as parents: utf8mb4_unicode_ci

USE agrifarm;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `inventory_logs`;

-- ─── refresh_tokens ─────────────────────────────────────────────
CREATE TABLE `refresh_tokens` (
  `id`         VARCHAR(36)  NOT NULL COLLATE utf8mb4_unicode_ci,
  `user_id`    VARCHAR(36)  NOT NULL COLLATE utf8mb4_unicode_ci,
  `token_hash` VARCHAR(255) NOT NULL COLLATE utf8mb4_unicode_ci,
  `expires_at` TIMESTAMP    NOT NULL,
  `revoked_at` TIMESTAMP    NULL DEFAULT NULL,
  `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id`  (`user_id`),
  INDEX `idx_expires`  (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── wishlist ────────────────────────────────────────────────────
CREATE TABLE `wishlist` (
  `id`         VARCHAR(36) NOT NULL COLLATE utf8mb4_unicode_ci,
  `user_id`    VARCHAR(36) NOT NULL COLLATE utf8mb4_unicode_ci,
  `product_id` VARCHAR(36) NOT NULL COLLATE utf8mb4_unicode_ci,
  `created_at` TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_product` (`user_id`, `product_id`),
  INDEX `idx_user`    (`user_id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`user_id`)    REFERENCES `users`    (`uid`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── order_items ─────────────────────────────────────────────────
CREATE TABLE `order_items` (
  `id`        INT           AUTO_INCREMENT NOT NULL,
  `orderId`   VARCHAR(36)   NOT NULL COLLATE utf8mb4_unicode_ci,
  `productId` VARCHAR(36)   NOT NULL COLLATE utf8mb4_unicode_ci,
  `name`      VARCHAR(200)  NOT NULL COLLATE utf8mb4_unicode_ci,
  `quantity`  INT           NOT NULL DEFAULT 1,
  `price`     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  INDEX `idx_order`   (`orderId`),
  INDEX `idx_product` (`productId`),
  FOREIGN KEY (`orderId`)   REFERENCES `orders`   (`orderId`) ON DELETE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`)      ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── payments ────────────────────────────────────────────────────
CREATE TABLE `payments` (
  `id`                 VARCHAR(36)   NOT NULL COLLATE utf8mb4_unicode_ci,
  `order_id`           VARCHAR(36)   NOT NULL COLLATE utf8mb4_unicode_ci,
  `amount`             DECIMAL(10,2) NOT NULL,
  `currency`           VARCHAR(5)    DEFAULT 'INR' COLLATE utf8mb4_unicode_ci,
  `method`             ENUM('COD','UPI','CARD','NETBANKING','WALLET') NOT NULL DEFAULT 'COD',
  `status`             ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING',
  `gateway_payment_id` VARCHAR(200)  DEFAULT NULL COLLATE utf8mb4_unicode_ci,
  `gateway_response`   JSON          DEFAULT NULL,
  `paid_at`            TIMESTAMP     NULL DEFAULT NULL,
  `created_at`         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_order` (`order_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status`   (`status`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`orderId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── inventory_logs ──────────────────────────────────────────────
CREATE TABLE `inventory_logs` (
  `id`          INT         AUTO_INCREMENT NOT NULL,
  `product_id`  VARCHAR(36) NOT NULL COLLATE utf8mb4_unicode_ci,
  `change`      INT         NOT NULL,
  `reason`      ENUM('SALE','RESTOCK','ADJUSTMENT','RETURN') NOT NULL,
  `ref_id`      VARCHAR(36) DEFAULT NULL COLLATE utf8mb4_unicode_ci,
  `stock_after` INT         NOT NULL,
  `created_at`  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_product`  (`product_id`),
  INDEX `idx_reason`   (`reason`),
  INDEX `idx_created`  (`created_at`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify all 12 tables
SELECT COUNT(*) AS total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'agrifarm';
SHOW TABLES;
