import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTestDatabaseUrl, verifyConnectedDatabase } from './support/database-safety.mjs';

const valid = 'postgresql://aurum:password@127.0.0.1:5434/aurum_test';
test('test database guard accepts only the intended local database', () => {
  assert.equal(validateTestDatabaseUrl(valid, 'test'), valid);
  for (const unsafe of [
    'postgresql://aurum:password@db.example/aurum_test',
    'postgresql://aurum:password@127.0.0.1/aurum',
    'postgresql://aurum:password@127.0.0.1/other_test',
    'postgresql://aurum:password@127.0.0.1/aurum_test?host=remote',
    'postgresql://127.0.0.1/aurum_test',
    'https://aurum:password@127.0.0.1/aurum_test',
    'not-a-url',
  ]) assert.throws(() => validateTestDatabaseUrl(unsafe, 'test'));
  assert.throws(() => validateTestDatabaseUrl(valid, 'production'));
});

test('test database guard verifies the server-selected database', async () => {
  await verifyConnectedDatabase({ query: async () => ({ rows: [{ database: 'aurum_test' }] }) });
  await assert.rejects(() => verifyConnectedDatabase({ query: async () => ({ rows: [{ database: 'aurum' }] }) }));
  await assert.rejects(() => verifyConnectedDatabase({ query: async () => ({ rows: [] }) }));
});
