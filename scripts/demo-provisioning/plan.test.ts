import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoPlan, type DemoRecord } from './plan';
const a = '00000000-0000-4000-8000-000000000001';
const b = '00000000-0000-4000-8000-000000000002';
const c = '00000000-0000-4000-8000-000000000003';
const fingerprint = 'a'.repeat(64);
const company: DemoRecord = { id: a, kind: 'company', companyId: a, marker: 'DEMO', fingerprint, dependsOn: [] };
const branch: DemoRecord = { id: b, kind: 'branch', companyId: a, marker: 'DEMO', fingerprint, dependsOn: [a] };
test('orders dependency before dependent and reports unchanged on repeated data', () => {
  const plan = createDemoPlan(a, [branch, company], [company]);
  assert.deepEqual(plan.steps.map(step => [step.id, step.action]), [[a, 'unchanged'], [b, 'create']]);
  assert.deepEqual(createDemoPlan(a, [company, branch], [company, branch]).steps.map(step => step.action), ['unchanged', 'unchanged']);
});
test('rejects cross-company data, collisions, missing links and cycles', () => {
  assert.throws(() => createDemoPlan(a, [company, { ...branch, companyId: c }], []));
  assert.throws(() => createDemoPlan(a, [company, company], []));
  assert.throws(() => createDemoPlan(a, [branch], []), /Unresolved/);
  assert.throws(() => createDemoPlan(a, [{ ...company, dependsOn: [b] }, branch], []), /cycle/);
  assert.throws(() => createDemoPlan(a, [company], [{ ...company, fingerprint: 'b'.repeat(64) }]), /conflict/);
  assert.throws(() => createDemoPlan(a, [company], [{ ...company, companyId: c }]), /conflict/);
  assert.throws(() => createDemoPlan(a, [company], [{ ...company, marker: 'REAL' }]), /conflict/);
  assert.throws(() => createDemoPlan(a, [company], [{ ...company, marker: 'UNKNOWN' }]), /conflict/);
  assert.throws(() => createDemoPlan(a, [{ ...company, id: 'aaaaaaaa-aaaa-4aaa-8aaa-AAAAAAAAAAAA' }], []));
  assert.throws(() => createDemoPlan(a, [company, branch], [branch]), /unresolved persisted dependency/);
});
