import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRelationships } from '../scripts/database-verify';

test('verification fails closed on wrong selected database and reports absent HRM tables', async () => {
  await assert.rejects(verifyRelationships(async () => [{ db: 'wrong' }], 'mysql', 'target'), /does not match/);
  const result = await verifyRelationships(async sql => sql.includes('DATABASE() AS db') ? [{ db: 'target' }] : [{ name: 'companies' }], 'mysql', 'target');
  assert.equal(result.relationships.length, 4);
  assert.ok(result.relationships.every(check => check.status === 'unavailable'));
});
test('verification distinguishes empty data, valid relationships and broken relationships', async () => {
  const names = ['companies', 'branches', 'hrm_departments', 'hrm_employees', 'hrm_attendance'];
  const result = await verifyRelationships(async sql => {
    if (sql.includes('current_database()')) return [{ db: 'target' }];
    if (sql.includes('information_schema')) return names.map(name => ({ name }));
    if (sql === 'SELECT COUNT(*) AS n FROM branches') return [{ n: '0' }];
    if (sql.includes('LEFT JOIN hrm_departments')) return [{ n: '1' }];
    if (sql.includes('LEFT JOIN')) return [{ n: '0' }];
    return [{ n: '2' }];
  }, 'postgresql', 'target');
  assert.deepEqual(result.relationships.map(check => check.status), ['empty', 'verified', 'violations', 'verified']);
});
