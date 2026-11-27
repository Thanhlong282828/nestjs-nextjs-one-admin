-- Run as 'nestjs'@'localhost', after an authorized DBA applies reviewed grants.
-- Stop if DATABASE() or CURRENT_USER() do not identify aurum_nestjs / nestjs@localhost.
-- Each EXPLAIN must fail with privilege-denied; success means readiness FAILED.
-- EXPLAIN only checks SQL privileges and does not prove HTTP authorization.
SELECT DATABASE() AS database_name, CURRENT_USER() AS authenticated_principal;
SHOW GRANTS FOR CURRENT_USER;
SELECT 1 FROM `companies` LIMIT 0;
SELECT 1 FROM `tenant_classification` LIMIT 0;
SELECT 1 FROM `branches` LIMIT 0;
SELECT 1 FROM `hrm_employees` LIMIT 0;
EXPLAIN DELETE FROM `companies` WHERE 1=0;
EXPLAIN UPDATE `tenant_classification` SET `classification`=`classification` WHERE 1=0;
EXPLAIN UPDATE `tenant_classification` SET `provenance`=`provenance` WHERE 1=0;
EXPLAIN UPDATE `tenant_classification` SET `source_reference`=`source_reference` WHERE 1=0;
EXPLAIN DELETE FROM `tenant_classification` WHERE 1=0;
EXPLAIN UPDATE `classified_branch_scope` SET `classification`=`classification` WHERE 1=0;
EXPLAIN DELETE FROM `classified_branch_scope` WHERE 1=0;
-- Confirm runtime has no CREATE, ALTER, DROP, TRIGGER, GRANT OPTION, broad grants,
-- role grants or protected column-level writes by inspecting SHOW GRANTS at all scopes.
-- Exercise authorized employee and audit writes only against isolated test fixtures.
