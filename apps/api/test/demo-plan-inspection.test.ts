import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectDemoPlan } from '../scripts/demo-plan-inspection';
import { DEMO_082 } from '../scripts/connected-demo-provisioner';

test('preview distinguishes unused, owned, conflicting and inaccessible company identities', async () => {
  assert.equal((await inspectDemoPlan(async () => [])).status, 'new');
  assert.equal((await inspectDemoPlan(async sql => sql.includes('`hrm_employees`') ? [{ id: 'existing' }] : [])).status, 'conflict');
  assert.equal((await inspectDemoPlan(async sql => sql.includes('identity_users') ? [{ id: 'existing' }] : [])).status, 'conflict');
  assert.equal((await inspectDemoPlan(async sql => { if (sql.includes('`branches`')) throw Object.assign(new Error('denied'), { code: 'ER_TABLEACCESS_DENIED_ERROR' }); return []; })).status, 'unavailable');
  assert.equal((await inspectDemoPlan(async sql => sql.startsWith('SELECT id') ? [{ id: DEMO_082.companyId }] : [{ classification: 'DEMO', provenance: DEMO_082.provenance }])).status, 'owned');
  assert.equal((await inspectDemoPlan(async sql => sql.startsWith('SELECT id') ? [{ id: DEMO_082.companyId }] : [{ classification: 'REAL', provenance: 'other' }])).status, 'conflict');
  assert.equal((await inspectDemoPlan(async () => { throw Object.assign(new Error('denied'), { code: 'ER_TABLEACCESS_DENIED_ERROR' }); })).status, 'unavailable');
  await assert.rejects(inspectDemoPlan(async () => { throw new Error('network'); }), /network/);
});
