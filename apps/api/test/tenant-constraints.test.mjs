import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { authorizeBranch, authorizeCompany } from '@aurum/access';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('database rejects a branch grant across companies', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const url = new URL(testUrl);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306','3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw Error('Refusing unapproved test database');
  const client = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) });
  const companyA = randomUUID(), companyB = randomUUID(), branchA = randomUUID(), branchB = randomUUID(), branchUnassigned = randomUUID(), userId = randomUUID();
  const rollback = new Error('ROLLBACK_TEST_ONLY');
  try {
    const actual = await client.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    await assert.rejects(client.$transaction(async tx => {
      await tx.company.createMany({ data: [{id: companyA, name: 'Test A'}, {id: companyB, name: 'Test B'}] });
      await tx.identityUser.create({ data: {id: userId, email: `${userId}@example.test`, passwordHash: 'test-only-not-a-login'} });
      await tx.companyMembership.create({ data: {companyId: companyA, userId} });
      await tx.branch.createMany({ data: [{id: branchA, companyId: companyA, name: 'A'}, {id: branchB, companyId: companyB, name: 'B'}, {id: branchUnassigned, companyId: companyA, name: 'Unassigned'}] });
      await tx.branchGrant.create({ data: {companyId: companyA, userId, branchId: branchA} });
      await assert.rejects(tx.branchGrant.create({ data: {companyId: companyA, userId, branchId: branchB} }), error => error.code === 'P2003');
      const membership = await tx.companyMembership.findUniqueOrThrow({ where: { companyId_userId: { companyId: companyA, userId } }, include: { grants: true } });
      // Permission is an isolated test fixture; a real server-side permission store is not implemented yet.
      const principal = { userId, status: 'active', memberships: [{ companyId: membership.companyId, status: membership.status, permissions: ['employee.read'], branchIds: membership.grants.map(grant => grant.branchId) }] };
      const [allowed, wrongBranch, wrongCompany] = await Promise.all([tx.branch.findUniqueOrThrow({ where: { id: branchA } }), tx.branch.findUniqueOrThrow({ where: { id: branchUnassigned } }), tx.branch.findUniqueOrThrow({ where: { id: branchB } })]);
      assert.equal(authorizeCompany(principal, companyB, 'employee.read').allowed, false);
      assert.equal(authorizeBranch(principal, companyA, allowed, 'employee.read').allowed, true);
      assert.equal(authorizeBranch(principal, companyA, wrongBranch, 'employee.read').allowed, false);
      assert.equal(authorizeBranch(principal, companyA, wrongCompany, 'employee.read').allowed, false);
      throw rollback;
    }), error => error === rollback);
    assert.equal(await client.company.count({ where: { id: { in: [companyA, companyB] } } }), 0);
  } finally { await client.$disconnect(); }
});
