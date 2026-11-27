CREATE TABLE `hrm_security_audit` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `event` VARCHAR(32) NOT NULL,
  `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `hrm_security_audit_user_time_idx` (`user_id`, `occurred_at`),
  CONSTRAINT `hrm_security_audit_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `identity_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
