import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const original = join(process.cwd(), 'prisma/mysql-migrations');
const application = join(process.cwd(), 'prisma/mysql-app-migrations');
test('application migration stream preserves published SQL and excludes the test-only migration', () => {
  const dirs = readdirSync(application, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(dirs, ['202611250001_init', '202611250003_identity_org', '202611250004_sessions', '202611250005_auth_audit', '202611270006_hrm_organization', '202611270007_membership_permissions', '202611270008_hrm_read_audit', '202611270009_hrm_employee_audit', '202611270010_hrm_security_audit', '202611270012_tenant_classification_constraints']);
  for (const dir of dirs) assert.equal(readFileSync(join(application, dir, 'migration.sql'), 'utf8'), readFileSync(join(original, dir, 'migration.sql'), 'utf8'));
  assert.equal(readFileSync(join(application, 'migration_lock.toml'), 'utf8'), readFileSync(join(original, 'migration_lock.toml'), 'utf8'));
});
