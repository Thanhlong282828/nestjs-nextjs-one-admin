-- Test-only role; create the account separately with a generated secret.
-- Do not execute on development or production without a separate review.
GRANT SELECT ON aurum_nestjs_test.companies TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.branches TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.company_memberships TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.membership_permissions TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.branch_grants TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.identity_users TO 'aurum_runtime_test'@'%';
-- Login uses a shared locking read and needs no identity_users UPDATE grant.
GRANT SELECT ON aurum_nestjs_test.hrm_departments TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.tenant_classification TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.classified_branch_scope TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT, UPDATE ON aurum_nestjs_test.identity_sessions TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT, UPDATE ON aurum_nestjs_test.hrm_employees TO 'aurum_runtime_test'@'%';
GRANT SELECT ON aurum_nestjs_test.hrm_attendance TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT ON aurum_nestjs_test.identity_auth_audit TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT ON aurum_nestjs_test.hrm_read_audit TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT ON aurum_nestjs_test.hrm_employee_audit TO 'aurum_runtime_test'@'%';
GRANT SELECT, INSERT ON aurum_nestjs_test.hrm_security_audit TO 'aurum_runtime_test'@'%';
