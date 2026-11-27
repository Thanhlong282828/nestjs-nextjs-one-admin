-- Additive audit table. No credentials, tokens or token hashes are stored.
CREATE TABLE `identity_auth_audit` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `event` VARCHAR(32) NOT NULL,
  `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `identity_auth_audit_user_id_occurred_at_idx` (`user_id`, `occurred_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
