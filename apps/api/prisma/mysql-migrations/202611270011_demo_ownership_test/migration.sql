CREATE TABLE `demo_ownership` (
  `id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36) NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `fingerprint` CHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `demo_ownership_company_kind_idx` (`company_id`, `kind`),
  CONSTRAINT `demo_ownership_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
