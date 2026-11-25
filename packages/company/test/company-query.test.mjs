import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { GetCompanyQuery, GetCompanyQueryHandler, ListCompaniesQuery, ListCompaniesQueryHandler } from '../dist/index.js';

test('company query checks permission and company before touching the repository', async () => {
  const userId = randomUUID(), allowedId = randomUUID(), otherId = randomUUID();
  const principal = { userId, status: 'active', memberships: [{ companyId: allowedId, status: 'active', permissions: ['company.read'], branchIds: [] }] };
  let calls = 0;
  const handler = new GetCompanyQueryHandler({ async findById(id) { calls++; return { id, name: 'Test' }; } });
  assert.equal(await handler.execute(new GetCompanyQuery(null, allowedId)), null);
  assert.equal(await handler.execute(new GetCompanyQuery(principal, otherId)), null);
  assert.equal(await handler.execute(new GetCompanyQuery({ ...principal, status: 'disabled' }, allowedId)), null);
  assert.equal(calls, 0);
  assert.deepEqual(await handler.execute(new GetCompanyQuery(principal, allowedId)), { id: allowedId, name: 'Test' });
  assert.equal(calls, 1);
});

test('missing company remains unavailable', async () => {
  const companyId = randomUUID();
  const principal = { userId: randomUUID(), status: 'active', memberships: [{ companyId, status: 'active', permissions: ['company.read'], branchIds: [] }] };
  const handler = new GetCompanyQueryHandler({ async findById() { return null; } });
  assert.equal(await handler.execute(new GetCompanyQuery(principal, companyId)), null);
});

test('list scopes IDs before repository lookup and denies disabled, duplicate or unpermitted memberships', async () => {
  const a = randomUUID(), b = randomUUID(), c = randomUUID(), d = randomUUID();
  const principal = { userId: randomUUID(), status: 'active', memberships: [
    {companyId: a, status: 'active', permissions: ['company.read'], branchIds: []},
    {companyId: b, status: 'active', permissions: [], branchIds: []},
    {companyId: c, status: 'suspended', permissions: ['company.read'], branchIds: []},
    {companyId: d, status: 'active', permissions: ['company.read'], branchIds: []},
    {companyId: d, status: 'active', permissions: ['company.read'], branchIds: []},
  ] };
  let input;
  const handler = new ListCompaniesQueryHandler({ async findPage(criteria) { input = criteria; return { items: [], total: 0 }; } });
  await handler.execute(new ListCompaniesQuery(principal, '  Test  ', 2, 10));
  assert.deepEqual(input, { allowedCompanyIds: [a], search: 'Test', offset: 10, limit: 10 });
  input = undefined;
  assert.deepEqual(await handler.execute(new ListCompaniesQuery(null, '', 1, 10)), { items: [], total: 0 });
  assert.deepEqual(await handler.execute(new ListCompaniesQuery({ ...principal, status: 'disabled' }, '', 1, 10)), { items: [], total: 0 });
  assert.equal(input, undefined);
  for (const [search, page, size] of [['', 0, 10], ['', 1, 101], ['a'.repeat(101), 1, 10]]) {
    await assert.rejects(handler.execute(new ListCompaniesQuery(principal, search, page, size)), /Invalid/);
  }
});
