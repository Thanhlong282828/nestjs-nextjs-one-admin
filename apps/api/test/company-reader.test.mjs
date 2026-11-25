import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaCompanyReader } from '../src/company/prisma-company.reader.ts';
import { GetCompanyQuery, GetCompanyQueryHandler, ListCompaniesQuery, ListCompaniesQueryHandler } from '@aurum/company';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('company reader uses MySQL test database and query enforces tenant permission', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const url = new URL(testUrl);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw Error('Refusing unapproved test database');
  const client = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) });
  const a = randomUUID(), b = randomUUID(), userId = randomUUID(), rollback = new Error('ROLLBACK_TEST_ONLY');
  try {
    const actual = await client.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    await assert.rejects(client.$transaction(async tx => {
      await tx.company.createMany({ data: [{ id: a, name: 'Test A' }, { id: b, name: 'Test B' }] });
      const principal = { userId, status: 'active', memberships: [{ companyId: a, status: 'active', permissions: ['company.read'], branchIds: [] }] };
      const handler = new GetCompanyQueryHandler(new PrismaCompanyReader(tx));
      assert.deepEqual(await handler.execute(new GetCompanyQuery(principal, a)), { id: a, name: 'Test A' });
      assert.equal(await handler.execute(new GetCompanyQuery(principal, b)), null);
      assert.equal(await handler.execute(new GetCompanyQuery(null, a)), null);
      const list = new ListCompaniesQueryHandler(new PrismaCompanyReader(tx));
      assert.deepEqual(await list.execute(new ListCompaniesQuery(principal, 'Test', 1, 10)), { items: [{ id: a, name: 'Test A' }], total: 1 });
      assert.deepEqual(await list.execute(new ListCompaniesQuery(principal, 'Test B', 1, 10)), { items: [], total: 0 });
      assert.deepEqual(await list.execute(new ListCompaniesQuery(principal, "' OR 1=1 --", 1, 10)), { items: [], total: 0 });
      assert.deepEqual(await list.execute(new ListCompaniesQuery(principal, '', 2, 1)), { items: [], total: 1 });
      throw rollback;
    }), error => error === rollback);
    assert.equal(await client.company.count({ where: { id: { in: [a, b] } } }), 0);
  } finally { await client.$disconnect(); }
});
