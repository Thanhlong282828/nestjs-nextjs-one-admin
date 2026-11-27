-- Additive only: no backfill, classification changes or privileged triggers.
CREATE TABLE `tenant_classification` (
 `company_id` VARCHAR(36) NOT NULL,
 `classification` VARCHAR(4) COLLATE utf8mb4_bin NOT NULL,
 `provenance` VARCHAR(128) NOT NULL,
 `source_reference` VARCHAR(255) NULL,
 `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`company_id`),
 UNIQUE KEY `tenant_classification_company_kind_key` (`company_id`, `classification`),
 CONSTRAINT `tenant_classification_company_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT `tenant_classification_kind_check` CHECK (`classification` IN ('REAL', 'DEMO')),
 CONSTRAINT `tenant_classification_provenance_check` CHECK (CHAR_LENGTH(TRIM(`provenance`)) > 0),
 CONSTRAINT `tenant_classification_real_source_check` CHECK (`classification` <> 'REAL' OR (`source_reference` IS NOT NULL AND CHAR_LENGTH(TRIM(`source_reference`)) > 0))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `classified_branch_scope` (
 `company_id` VARCHAR(36) NOT NULL,
 `branch_id` VARCHAR(36) NOT NULL,
 `classification` VARCHAR(4) COLLATE utf8mb4_bin NOT NULL,
 PRIMARY KEY (`company_id`, `branch_id`),
 CONSTRAINT `classified_branch_tenant_fkey` FOREIGN KEY (`company_id`, `classification`) REFERENCES `tenant_classification` (`company_id`, `classification`) ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT `classified_branch_branch_fkey` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
