import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { runtimeEnvironment } from '../scripts/runtime-environment';

test('API launch environment removes migration and test database URLs', () => {
  const source = { DATABASE_URL: 'mysql://runtime:secret@localhost:3306/db', MIGRATION_DATABASE_URL: 'mysql://migration:private-migration-value@localhost:3306/db', MYSQL_MIGRATION_TEST_DATABASE_URL: 'private-test-value', MYSQL_RUNTIME_PRIVILEGE_TEST_URL: 'private-test-runtime', AURUM_ENABLE_DEVELOPMENT_AUTH: '1' };
  const sanitized = runtimeEnvironment(source);
  assert.deepEqual(sanitized, { DATABASE_URL: source.DATABASE_URL, AURUM_ENABLE_DEVELOPMENT_AUTH: '1' });
  assert.match(source.MIGRATION_DATABASE_URL, /private-migration-value/);
  assert.throws(() => runtimeEnvironment({ DATABASE_URL: source.DATABASE_URL, MIGRATION_DATABASE_URL: source.DATABASE_URL }), /principals must be distinct/);
});

test('API refuses to start with migration credentials in its environment', () => {
  const inherited = { ...process.env };
  delete inherited.DATABASE_URL;
  delete inherited.MIGRATION_DATABASE_URL;
  const result = spawnSync(process.execPath, ['dist/main.js'], { cwd: resolve(__dirname, '..'), encoding: 'utf8', env: { ...runtimeEnvironment(inherited), MIGRATION_DATABASE_URL: 'private-test-value' }, timeout: 5000 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Migration credentials must not be supplied/);
  assert.doesNotMatch(result.stderr, /private-test-value/);
});
