import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadMigrationRegistry, verifyMigrationHistory } from '../scripts/migration-integrity';

test('application registry rejects checksum drift, missing predecessor and unresolved migration', () => {
  const registry = loadMigrationRegistry('prisma/mysql-app-migrations');
  const first = registry[0]; const second = registry[1];
  assert.ok(first && second);
  const row = { migration_name: first.name, checksum: first.checksum, finished_at: new Date(), rolled_back_at: null };
  assert.doesNotThrow(() => verifyMigrationHistory(registry, [row]));
  assert.throws(() => verifyMigrationHistory(registry, [{ ...row, checksum: 'wrong' }]), /drift/);
  assert.throws(() => verifyMigrationHistory(registry, [{ ...row, migration_name: second.name, checksum: second.checksum }]), /drift/);
  assert.throws(() => verifyMigrationHistory(registry, [{ ...row, finished_at: null }]), /Unresolved/);
});
