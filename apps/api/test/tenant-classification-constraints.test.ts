import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import type { ExecutionContext } from '@nestjs/common';
import { ClassifiedEmployeeReadGuard } from '../src/identity/http/classified-branch.guard';
import { PrismaClassificationReader } from '../src/identity/prisma-classification.reader';
import { PrismaPrincipalReader } from '../src/identity/prisma-principal.reader';
import { PrismaBranchReader } from '../src/identity/prisma-branch.reader';

test('classification constraints reject missing provenance and cross-track branches on isolated MySQL', async () => {
  const connection = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
  if (!connection) throw new Error('Isolated MySQL test URL required');
  const url = new URL(connection);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw new Error('Refusing database target');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(connection) });
  const real = randomUUID(), demo = randomUUID(), unknown = randomUUID(), realBranch = randomUUID(), demoBranch = randomUUID();
  const rollback = new Error('ROLLBACK_TEST_ONLY');
  try {
    assert.equal((await db.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`)[0]?.db, 'aurum_nestjs_test');
    await assert.rejects(db.$transaction(async tx => {
      await tx.company.createMany({ data: [{ id: real, name: 'Test real' }, { id: demo, name: 'Test demo' }, { id: unknown, name: 'Test unknown' }] });
      await tx.branch.createMany({ data: [{ id: realBranch, companyId: real, name: 'Real branch' }, { id: demoBranch, companyId: demo, name: 'Demo branch' }] });
      await assert.rejects(tx.tenantClassification.create({ data: { companyId: unknown, classification: 'REAL', provenance: 'verified' } }));
      await assert.rejects(tx.tenantClassification.create({ data: { companyId: unknown, classification: 'DEMO', provenance: '  ' } }));
      await assert.rejects(tx.tenantClassification.create({ data: { companyId: unknown, classification: 'demo', provenance: 'test' } }));
      await tx.tenantClassification.create({ data: { companyId: real, classification: 'REAL', provenance: 'test', sourceReference: 'test-import-reference' } });
      await tx.tenantClassification.create({ data: { companyId: demo, classification: 'DEMO', provenance: 'test' } });
      // Documents the remaining security gap: a classification without a dependent scope is mutable.
      await tx.tenantClassification.create({ data: { companyId: unknown, classification: 'DEMO', provenance: 'test' } });
      await tx.tenantClassification.update({ where: { companyId: unknown }, data: { classification: 'REAL', sourceReference: 'test-import' } });
      await assert.rejects(tx.tenantClassification.create({ data: { companyId: real, classification: 'DEMO', provenance: 'duplicate' } }));
      await assert.rejects(tx.classifiedBranchScope.create({ data: { companyId: real, branchId: realBranch, classification: 'DEMO' } }));
      await assert.rejects(tx.classifiedBranchScope.create({ data: { companyId: demo, branchId: demoBranch, classification: 'REAL' } }));
      await assert.rejects(tx.classifiedBranchScope.create({ data: { companyId: real, branchId: demoBranch, classification: 'REAL' } }));
      await tx.classifiedBranchScope.create({ data: { companyId: real, branchId: realBranch, classification: 'REAL' } });
      await tx.classifiedBranchScope.create({ data: { companyId: demo, branchId: demoBranch, classification: 'DEMO' } });
      await assert.rejects(tx.tenantClassification.update({ where: { companyId: real }, data: { classification: 'DEMO' } }));
      await assert.rejects(tx.tenantClassification.delete({ where: { companyId: demo } }));
      const userId = randomUUID();
      await tx.identityUser.create({ data: { id: userId, email: `${userId}@example.invalid`, passwordHash: 'test-only' } });
      for (const [companyId, branchId, track] of [[real, realBranch, 'real'], [demo, demoBranch, 'demo']] as const) {
        await tx.companyMembership.create({ data: { companyId, userId } });
        await tx.branchGrant.create({ data: { companyId, userId, branchId } });
        await tx.membershipPermission.createMany({ data: ['employee.read', `tenant.${track}.read`].map(permission => ({ companyId, userId, permission })) });
      }
      const guard = (track: string) => new ClassifiedEmployeeReadGuard(new PrismaPrincipalReader(tx), new PrismaBranchReader(tx), new PrismaClassificationReader(tx), track);
      const context = (companyId: string, branchId: string) => ({ switchToHttp: () => ({ getRequest: () => ({ auth: { userId, sessionId: randomUUID() }, params: { companyId, branchId } }) }) }) as unknown as ExecutionContext;
      assert.equal(await guard('REAL').canActivate(context(real, realBranch)), true);
      assert.equal(await guard('DEMO').canActivate(context(demo, demoBranch)), true);
      await assert.rejects(guard('REAL').canActivate(context(demo, demoBranch)));
      await assert.rejects(guard('DEMO').canActivate(context(real, realBranch)));
      await assert.rejects(guard('REAL').canActivate(context(real, demoBranch)));
      await assert.rejects(guard('UNKNOWN').canActivate(context(real, realBranch)));
      throw rollback;
    }, { isolationLevel: 'Serializable' }), error => error === rollback);
    assert.equal(await db.company.count({ where: { id: { in: [real, demo, unknown] } } }), 0);
  } finally { await db.$disconnect(); }
});
