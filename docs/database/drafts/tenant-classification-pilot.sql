CREATE TABLE `tenant_classification` (
 `company_id` VARCHAR(36) NOT NULL,
 `classification` VARCHAR(4) NOT NULL,
 `provenance` VARCHAR(128) NOT NULL,
 `source_reference` VARCHAR(255) NULL,
 `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`company_id`),
 UNIQUE KEY `tenant_classification_company_kind_key` (`company_id`, `classification`),
 CONSTRAINT `tenant_classification_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT `tenant_classification_kind_check` CHECK (BINARY `classification` IN ('REAL', 'DEMO')),
 CONSTRAINT `tenant_classification_provenance_check` CHECK (CHAR_LENGTH(TRIM(`provenance`)) > 0),
 CONSTRAINT `tenant_classification_real_source_check` CHECK (BINARY `classification` <> 'REAL' OR (`source_reference` IS NOT NULL AND CHAR_LENGTH(TRIM(`source_reference`)) > 0))
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `classified_branch_scope` (
 `company_id` VARCHAR(36) NOT NULL,
 `branch_id` VARCHAR(36) NOT NULL,
 `classification` VARCHAR(4) NOT NULL,
 PRIMARY KEY (`company_id`, `branch_id`),
 CONSTRAINT `classified_branch_scope_kind_check` CHECK (BINARY `classification` IN ('REAL', 'DEMO')),
 CONSTRAINT `classified_branch_scope_tenant_fkey` FOREIGN KEY (`company_id`, `classification`) REFERENCES `tenant_classification` (`company_id`, `classification`) ON DELETE RESTRICT ON UPDATE RESTRICT,
 CONSTRAINT `classified_branch_scope_branch_fkey` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `tenant_classification_event` (
 `id` BIGINT NOT NULL AUTO_INCREMENT,
 `company_id` VARCHAR(36) NOT NULL,
 `classification` VARCHAR(4) NOT NULL,
 `event` VARCHAR(16) NOT NULL,
 `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`id`),
 KEY `tenant_classification_event_scope_idx` (`company_id`, `occurred_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TRIGGER `tenant_classification_created` AFTER INSERT ON `tenant_classification` FOR EACH ROW INSERT INTO `tenant_classification_event` (`company_id`, `classification`, `event`) VALUES (NEW.`company_id`, NEW.`classification`, 'created');
CREATE TRIGGER `tenant_classification_immutable_update` BEFORE UPDATE ON `tenant_classification` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tenant classification is immutable';
CREATE TRIGGER `tenant_classification_immutable_delete` BEFORE DELETE ON `tenant_classification` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tenant classification is immutable';
