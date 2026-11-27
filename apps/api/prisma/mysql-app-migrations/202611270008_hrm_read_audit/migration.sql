CREATE TABLE `hrm_read_audit` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36) NOT NULL,
  `branch_id` VARCHAR(36) NOT NULL,
  `resource` VARCHAR(32) NOT NULL,
  `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `hrm_read_audit_scope_time_idx` (`company_id`, `branch_id`, `occurred_at`),
  KEY `hrm_read_audit_user_time_idx` (`user_id`, `occurred_at`),
  CONSTRAINT `hrm_read_audit_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `identity_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `hrm_read_audit_company_id_branch_id_fkey` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
