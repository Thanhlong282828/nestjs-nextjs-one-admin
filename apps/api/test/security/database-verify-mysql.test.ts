import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { verifyConfiguredDatabase } from '../../scripts/database-verify';
import { provisionTestDemo, type TestDemoManifest } from '../../scripts/demo-test-provisioner';

function testTarget(raw: string | undefined, user: string): string {
  if (!raw) throw new Error('Separate isolated test connection is required');
  const url = new URL(raw);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || url.port !== '3307' || url.pathname !== '/aurum_nestjs_test' || url.username !== user || url.search || url.hash) throw new Error('Refusing non-test database');
  return raw;
}

test('read-only verification detects persisted related HRM records on isolated MySQL', async () => {
  const runtime = testTarget(process.env.MYSQL_RUNTIME_PRIVILEGE_TEST_URL, 'aurum_runtime_test');
  const migration = testTarget(process.env.MYSQL_MIGRATION_PRIVILEGE_TEST_URL, 'aurum_migrate_test');
  const manifest: TestDemoManifest = {
    company: { id: randomUUID(), name: '[TEST] Company' }, branch: { id: randomUUID(), name: '[TEST] Branch' },
    department: { id: randomUUID(), code: 'TEST', name: '[TEST] Department' }, employee: { id: randomUUID(), code: `E-${randomUUID().slice(0, 8)}`, fullName: '[TEST] Employee' },
    attendance: { id: randomUUID(), workDate: '2026-01-02', status: 'present' },
  };
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = 'test'; let created = false;
  try {
    await provisionTestDemo(migration, manifest, 'apply'); created = true;
    const result = await verifyConfiguredDatabase(runtime);
    assert.equal(result.engine, 'mysql'); assert.equal(result.database, 'aurum_nestjs_test');
    assert.ok(result.relationships.every(check => check.status === 'verified' && BigInt(check.records ?? '0') > 0n));
  } finally {
    if (created) await provisionTestDemo(migration, manifest, 'rollback');
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});
