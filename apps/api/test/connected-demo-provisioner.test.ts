import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provisionConnectedDemo, stableDemoId } from '../scripts/connected-demo-provisioner';

test('connected DEMO IDs are stable, unique, and separated by entity kind', () => {
  const ids = ['branch', 'department', 'employee', 'attendance'].flatMap(kind => Array.from({ length: 300 }, (_, i) => stableDemoId(kind, i)));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(stableDemoId('employee', 3), stableDemoId('employee', 3));
});

test('connected DEMO provisioner refuses unverified targets before opening a connection', async () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'test';
    for (const url of ['mysql://nestjs_migrate:example@127.0.0.1:3306/aurum_nestjs', 'mysql://root:example@127.0.0.1:3308/aurum_nestjs_test', 'postgresql://aurum_app_migrator:example@127.0.0.1:3308/aurum_nestjs_test']) {
      await assert.rejects(provisionConnectedDemo(url, 'a-long-test-password'), /Refusing non-test target/);
    }
    process.env.NODE_ENV = 'production';
    await assert.rejects(provisionConnectedDemo('mysql://aurum_app_migrator:example@127.0.0.1:3308/aurum_nestjs_test', 'a-long-test-password'), /Refusing non-test target/);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
