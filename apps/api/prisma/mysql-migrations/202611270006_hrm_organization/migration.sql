-- Additive HRM foundation. Composite keys constrain company and branch ownership.
CREATE TABLE `hrm_departments` (
  `id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36) NOT NULL,
  `branch_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrm_departments_company_branch_id_key` (`company_id`, `branch_id`, `id`),
  UNIQUE KEY `hrm_departments_company_branch_code_key` (`company_id`, `branch_id`, `code`),
  CONSTRAINT `hrm_departments_branch_fkey` FOREIGN KEY (`company_id`, `branch_id`) REFERENCES `branches` (`company_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hrm_employees` (
  `id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36) NOT NULL,
  `branch_id` VARCHAR(36) NOT NULL,
  `department_id` VARCHAR(36) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrm_employees_company_branch_id_key` (`company_id`, `branch_id`, `id`),
  UNIQUE KEY `hrm_employees_company_code_key` (`company_id`, `code`),
  KEY `hrm_employees_scope_department_status_idx` (`company_id`, `branch_id`, `department_id`, `status`),
  CONSTRAINT `hrm_employees_department_fkey` FOREIGN KEY (`company_id`, `branch_id`, `department_id`) REFERENCES `hrm_departments` (`company_id`, `branch_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `hrm_attendance` (
  `id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36) NOT NULL,
  `branch_id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `work_date` DATE NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrm_attendance_scope_employee_date_key` (`company_id`, `branch_id`, `employee_id`, `work_date`),
  KEY `hrm_attendance_scope_date_idx` (`company_id`, `branch_id`, `work_date`),
  CONSTRAINT `hrm_attendance_employee_fkey` FOREIGN KEY (`company_id`, `branch_id`, `employee_id`) REFERENCES `hrm_employees` (`company_id`, `branch_id`, `id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
