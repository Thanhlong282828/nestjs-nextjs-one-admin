-- DBA ONLY, LOCAL DEVELOPMENT: review SHOW GRANTS immediately before execution.
-- Scope: MySQL 127.0.0.1:3306 / aurum_nestjs / 'nestjs'@'localhost'.
-- 2026-11-28 observation: runtime has USAGE globally and SELECT, INSERT, UPDATE,
-- DELETE on aurum_nestjs.companies at TABLE level; no database/global DDL or
-- GRANT OPTION was observed. These REVOKEs match THAT observed source only.
-- If current grants differ, STOP: audit roles, global, schema, table and column
-- grants and prepare source-specific REVOKEs; a table REVOKE cannot override a
-- schema/global grant. Do not revoke other databases, migration-account rights,
-- or use blanket REVOKE ALL. Account separation and existing tables are required.
-- Current application uses companies for reads only. Confirm no other local
-- consumer needs writes before revoking; this changes effective permissions.
REVOKE INSERT, UPDATE, DELETE ON `aurum_nestjs`.`companies` FROM 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`companies` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`branches` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`company_memberships` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`membership_permissions` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`branch_grants` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`identity_users` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`hrm_departments` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`tenant_classification` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`classified_branch_scope` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT, UPDATE ON `aurum_nestjs`.`identity_sessions` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT, UPDATE ON `aurum_nestjs`.`hrm_employees` TO 'nestjs'@'localhost';
GRANT SELECT ON `aurum_nestjs`.`hrm_attendance` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT ON `aurum_nestjs`.`identity_auth_audit` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT ON `aurum_nestjs`.`hrm_read_audit` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT ON `aurum_nestjs`.`hrm_employee_audit` TO 'nestjs'@'localhost';
GRANT SELECT, INSERT ON `aurum_nestjs`.`hrm_security_audit` TO 'nestjs'@'localhost';
-- Verify SHOW GRANTS, then prove UPDATE/DELETE on tenant_classification and
-- classified_branch_scope are denied by this exact runtime principal.

-- Re-run SHOW GRANTS as runtime and NODE_ENV=development npm run db:permissions.
-- Test classification/provenance mutation and DDL denials on an isolated fixture;
-- perform positive business writes only in aurum_nestjs_test first. Applying this
-- file does not certify HTTP isolation or authorize production operations.
