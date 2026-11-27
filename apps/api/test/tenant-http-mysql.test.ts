import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Controller, Get, Module, Req, UseGuards } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { SessionService } from '@aurum/identity';
import { PrismaSessionStore } from '../src/identity/prisma-session.store';
import { PrismaPrincipalReader } from '../src/identity/prisma-principal.reader';
import { PrismaBranchReader } from '../src/identity/prisma-branch.reader';
import { SessionGuard, SESSION_AUTHENTICATOR } from '../src/identity/http/session.guard';
import { HrmReadBranchGuard, AttendanceReadBranchGuard, PRINCIPAL_READER, BRANCH_READER } from '../src/identity/http/branch-scope.guard';

test('HTTP branch guard reads live membership, permission and branch grants from MySQL', { skip: !process.env.MYSQL_MIGRATION_TEST_DATABASE_URL && 'Set isolated MySQL URL' }, async () => {
  const connection = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
  if (!connection) throw new Error('Missing test database');
  const url = new URL(connection);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw new Error('Refusing unapproved database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(connection) });
  const userId = randomUUID(), companyA = randomUUID(), companyB = randomUUID(), branchA = randomUUID(), branchB = randomUUID();
  const deptA = randomUUID(), deptB = randomUUID(), employeeA = randomUUID(), employeeB = randomUUID();
  let app: Awaited<ReturnType<typeof NestFactory.create>> | undefined;
  try {
    assert.equal((await db.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`)[0]?.db, 'aurum_nestjs_test');
    await db.company.createMany({ data: [{ id: companyA, name: 'Test A' }, { id: companyB, name: 'Test B' }] });
    await db.branch.createMany({ data: [{ id: branchA, companyId: companyA, name: 'Test A' }, { id: branchB, companyId: companyB, name: 'Test B' }] });
    await db.department.createMany({ data: [{ id: deptA, companyId: companyA, branchId: branchA, code: 'A', name: 'Test A' }, { id: deptB, companyId: companyB, branchId: branchB, code: 'B', name: 'Test B' }] });
    await db.employee.createMany({ data: [{ id: employeeA, companyId: companyA, branchId: branchA, departmentId: deptA, code: 'A', fullName: 'Test A' }, { id: employeeB, companyId: companyB, branchId: branchB, departmentId: deptB, code: 'B', fullName: 'Test B' }] });
    await db.attendance.createMany({ data: [{ id: randomUUID(), companyId: companyA, branchId: branchA, employeeId: employeeA, workDate: new Date('2026-01-02T00:00:00Z'), status: 'present' }, { id: randomUUID(), companyId: companyB, branchId: branchB, employeeId: employeeB, workDate: new Date('2026-01-02T00:00:00Z'), status: 'present' }] });
    await db.identityUser.create({ data: { id: userId, email: `${userId}@example.test`, passwordHash: 'test-only-placeholder' } });
    const sessions = new SessionService(new PrismaSessionStore(db));
    const session = await sessions.issue(userId);
    type Request = { hrmScope: { companyId: string; branchId: string } };
    class ProbeController {
      read(request: Request) { return request.hrmScope; }
      employees(request: Request) { return db.employee.findMany({ where: request.hrmScope, select: { id: true } }); }
      attendance(request: Request) { return db.attendance.findMany({ where: request.hrmScope, select: { employeeId: true } }); }
    }
    Controller('probe')(ProbeController);
    const descriptor = Object.getOwnPropertyDescriptor(ProbeController.prototype, 'read');
    if (!descriptor) throw new Error('Missing method');
    Get(':companyId/:branchId')(ProbeController.prototype, 'read', descriptor);
    Req()(ProbeController.prototype, 'read', 0);
    UseGuards(SessionGuard, HrmReadBranchGuard)(ProbeController.prototype, 'read', descriptor);
    for (const [method, path, guard] of [['employees', ':companyId/:branchId/employees', HrmReadBranchGuard], ['attendance', ':companyId/:branchId/attendance', AttendanceReadBranchGuard]] as const) {
      const methodDescriptor = Object.getOwnPropertyDescriptor(ProbeController.prototype, method);
      if (!methodDescriptor) throw new Error('Missing method');
      Get(path)(ProbeController.prototype, method, methodDescriptor);
      Req()(ProbeController.prototype, method, 0);
      UseGuards(SessionGuard, guard)(ProbeController.prototype, method, methodDescriptor);
    }
    class TestApp {}
    Module({ controllers: [ProbeController], providers: [SessionGuard, HrmReadBranchGuard, AttendanceReadBranchGuard,
      { provide: SESSION_AUTHENTICATOR, useValue: sessions },
      { provide: PRINCIPAL_READER, useValue: new PrismaPrincipalReader(db) },
      { provide: BRANCH_READER, useValue: new PrismaBranchReader(db) },
    ] })(TestApp);
    app = await NestFactory.create(TestApp, { logger: false, abortOnError: false });
    await app.listen(0, '127.0.0.1');
    const base = `${await app.getUrl()}/probe`;
    const read = (company: string, branch: string) => fetch(`${base}/${company}/${branch}`, { headers: { cookie: `aurum_session=${session.token}` } });
    assert.equal((await read(companyA, branchA)).status, 403);
    await db.companyMembership.create({ data: { companyId: companyA, userId } });
    await db.branchGrant.create({ data: { companyId: companyA, userId, branchId: branchA } });
    assert.equal((await read(companyA, branchA)).status, 403);
    await db.membershipPermission.create({ data: { companyId: companyA, userId, permission: 'employee.read' } });
    assert.equal((await read(companyA, branchA)).status, 200);
    const resource = (company: string, branch: string, kind: string) => fetch(`${base}/${company}/${branch}/${kind}`, { headers: { cookie: `aurum_session=${session.token}` } });
    assert.deepEqual(await (await resource(companyA, branchA, 'employees')).json(), [{ id: employeeA }]);
    assert.equal((await resource(companyB, branchB, 'employees')).status, 403);
    assert.equal((await resource(companyA, branchA, 'attendance')).status, 403);
    await db.membershipPermission.create({ data: { companyId: companyA, userId, permission: 'attendance.read' } });
    assert.deepEqual(await (await resource(companyA, branchA, 'attendance')).json(), [{ employeeId: employeeA }]);
    assert.equal((await resource(companyB, branchB, 'attendance')).status, 403);
    assert.equal((await resource(companyA, branchB, 'attendance')).status, 403);
    assert.equal((await read(companyB, branchB)).status, 403);
    assert.equal((await read(companyA, branchB)).status, 403);
    assert.deepEqual((await Promise.all([read(companyA, branchA), read(companyB, branchB)])).map(response => response.status), [200, 403]);
    await db.branchGrant.delete({ where: { companyId_userId_branchId: { companyId: companyA, userId, branchId: branchA } } });
    assert.equal((await read(companyA, branchA)).status, 403);
    await db.branchGrant.create({ data: { companyId: companyA, userId, branchId: branchA } });
    await db.companyMembership.update({ where: { companyId_userId: { companyId: companyA, userId } }, data: { status: 'suspended' } });
    assert.equal((await read(companyA, branchA)).status, 403);
    await db.companyMembership.update({ where: { companyId_userId: { companyId: companyA, userId } }, data: { status: 'active' } });
    await db.identityUser.update({ where: { id: userId }, data: { status: 'disabled' } });
    assert.equal((await read(companyA, branchA)).status, 401);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'active' } });
    await db.userSession.update({ where: { id: session.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await read(companyA, branchA)).status, 401);
  } finally {
    await app?.close();
    await db.branchGrant.deleteMany({ where: { userId } });
    await db.membershipPermission.deleteMany({ where: { userId } });
    await db.companyMembership.deleteMany({ where: { userId } });
    await db.userSession.deleteMany({ where: { userId } });
    await db.identityUser.deleteMany({ where: { id: userId } });
    await db.attendance.deleteMany({ where: { employeeId: { in: [employeeA, employeeB] } } });
    await db.employee.deleteMany({ where: { id: { in: [employeeA, employeeB] } } });
    await db.department.deleteMany({ where: { id: { in: [deptA, deptB] } } });
    await db.branch.deleteMany({ where: { id: { in: [branchA, branchB] } } });
    await db.company.deleteMany({ where: { id: { in: [companyA, companyB] } } });
    await db.$disconnect();
  }
});
