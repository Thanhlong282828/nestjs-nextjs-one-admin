-- Explicit grants only; membership alone never confers a business permission.
CREATE TABLE `membership_permissions` (
  `company_id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `permission` VARCHAR(80) NOT NULL,
  PRIMARY KEY (`company_id`, `user_id`, `permission`),
  CONSTRAINT `membership_permissions_membership_fkey`
    FOREIGN KEY (`company_id`, `user_id`)
    REFERENCES `company_memberships` (`company_id`, `user_id`)
    ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
