import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hashPassword } from '@aurum/identity';
import { PrismaClient } from '../../src/generated/prisma/client';

const root = process.cwd();
function target(raw: string | undefined, expectedUser: string): string {
  if (!raw) throw new Error('Separate test principal required');
  const url = new URL(raw);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || url.port !== '3307' || url.pathname !== '/aurum_nestjs_test' || url.username !== expectedUser || url.search || url.hash) throw new Error('Refusing test target');
  return raw;
}
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => { const server = createServer(); server.on('error', reject); server.listen(0, '127.0.0.1', () => { const address = server.address(); if (!address || typeof address === 'string') return reject(new Error('Invalid port')); server.close(() => resolve(address.port)); }); });
}
async function waitReady(url: string, child: ChildProcess): Promise<void> {
  for (let i = 0; i < 100; i++) { if (child.exitCode !== null) throw new Error('API exited'); try { if ((await fetch(url)).status < 500) return; } catch { /* retry local startup */ } await new Promise(resolve => setTimeout(resolve, 100)); }
  throw new Error('API startup timeout');
}
const denied = (error: unknown): boolean => error instanceof Error && /denied|not authorized|permission/i.test(error.message);

test('actual runtime principal cannot alter classification while authorized HRM HTTP operations work', async () => {
  const runtimeUrl = target(process.env.MYSQL_RUNTIME_PRIVILEGE_TEST_URL, 'aurum_runtime_test');
  const migrationUrl = target(process.env.MYSQL_MIGRATION_PRIVILEGE_TEST_URL, 'aurum_migrate_test');
  const runtime = new PrismaClient({ adapter: new PrismaMariaDb(runtimeUrl) });
  const migration = new PrismaClient({ adapter: new PrismaMariaDb(migrationUrl) });
  const companyId = randomUUID(), unreferencedCompanyId = randomUUID(), branchId = randomUUID(), departmentId = randomUUID(), userId = randomUUID(), employeeId = randomUUID(), email = `${randomUUID()}@example.invalid`;
  const realCompanyId = randomUUID(), realBranchId = randomUUID(), missingBranchId = randomUUID();
  const password = 'isolated-test-password-123'; let api: ChildProcess | undefined;
  try {
    for (const client of [runtime, migration]) assert.equal((await client.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`)[0]?.db, 'aurum_nestjs_test');
    const grants = await runtime.$queryRawUnsafe<Record<string, string>[]>('SHOW GRANTS');
    const grantLines = grants.flatMap(row => Object.values(row));
    const classificationGrant = grantLines.find(line => /ON `aurum_nestjs_test`\.`tenant_classification` TO /i.test(line));
    assert.ok(classificationGrant && /GRANT SELECT ON /i.test(classificationGrant));
    assert.ok(!grantLines.some(line => /ON `aurum_nestjs_test`\.\* TO /i.test(line)));
    assert.ok(grantLines.some(line => /GRANT SELECT ON `aurum_nestjs_test`\.`identity_users` TO /i.test(line)));
    await migration.company.create({ data: { id: companyId, name: '[TEST] Công ty' } });
    await migration.branch.create({ data: { id: branchId, companyId, name: '[TEST] Chi nhánh' } });
    await migration.department.create({ data: { id: departmentId, companyId, branchId, code: 'TEST', name: '[TEST] Phòng ban' } });
    await migration.identityUser.create({ data: { id: userId, email, passwordHash: await hashPassword(password) } });
    await migration.companyMembership.create({ data: { companyId, userId } });
    await migration.branchGrant.create({ data: { companyId, userId, branchId } });
    await migration.membershipPermission.createMany({ data: ['company.read', 'branch.read', 'department.read', 'employee.read', 'employee.create', 'employee.update', 'employee.change-status', 'attendance.read'].map(permission => ({ companyId, userId, permission })) });
    await migration.tenantClassification.create({ data: { companyId, classification: 'DEMO', provenance: 'isolated-test' } });
    await migration.classifiedBranchScope.create({ data: { companyId, branchId, classification: 'DEMO' } });
    await migration.company.create({ data: { id: unreferencedCompanyId, name: '[TEST] Unreferenced company' } });
    await migration.tenantClassification.create({ data: { companyId: unreferencedCompanyId, classification: 'DEMO', provenance: 'isolated-test' } });
    await migration.company.create({ data: { id: realCompanyId, name: '[TEST] Verified source tenant' } });
    await migration.branch.createMany({ data: [{ id: realBranchId, companyId: realCompanyId, name: '[TEST] REAL branch' }, { id: missingBranchId, companyId: realCompanyId, name: '[TEST] unclassified branch' }] });
    await migration.tenantClassification.create({ data: { companyId: realCompanyId, classification: 'REAL', provenance: 'isolated-test', sourceReference: 'verified-test-source' } });
    await migration.classifiedBranchScope.create({ data: { companyId: realCompanyId, branchId: realBranchId, classification: 'REAL' } });
    await migration.companyMembership.create({ data: { companyId: realCompanyId, userId } });
    await migration.branchGrant.createMany({ data: [realBranchId, missingBranchId].map(id => ({ companyId: realCompanyId, userId, branchId: id })) });
    await migration.membershipPermission.createMany({ data: ['company.read', 'branch.read', 'employee.read'].map(permission => ({ companyId: realCompanyId, userId, permission })) });
    assert.equal((await runtime.tenantClassification.findUnique({ where: { companyId } }))?.classification, 'DEMO');
    await assert.rejects(runtime.$executeRaw`UPDATE tenant_classification SET provenance = 'altered' WHERE company_id = ${companyId}`, denied);
    await assert.rejects(runtime.$executeRaw`DELETE FROM tenant_classification WHERE company_id = ${companyId}`, denied);
    await assert.rejects(runtime.$executeRaw`UPDATE tenant_classification SET classification = 'REAL', source_reference = 'test' WHERE company_id = ${unreferencedCompanyId}`, denied);
    await assert.rejects(runtime.$executeRaw`DELETE FROM tenant_classification WHERE company_id = ${unreferencedCompanyId}`, denied);
    await assert.rejects(runtime.$executeRaw`UPDATE classified_branch_scope SET classification = 'REAL' WHERE company_id = ${companyId}`, denied);
    await assert.rejects(runtime.$executeRaw`UPDATE identity_users SET created_at = created_at WHERE id = ${userId}`, denied);
    await assert.rejects(runtime.$executeRaw`UPDATE hrm_attendance SET status = status WHERE company_id = ${companyId}`, denied);
    assert.equal((await migration.tenantClassification.findUnique({ where: { companyId } }))?.provenance, 'isolated-test');
    await assert.rejects(migration.classifiedBranchScope.create({ data: { companyId, branchId: randomUUID(), classification: 'REAL' } }));
    const port = await freePort();
    const env = { PATH: process.env.PATH, NODE_ENV: 'test', DATABASE_URL: runtimeUrl, AURUM_ENABLE_DEVELOPMENT_AUTH: '1', AURUM_AUTH_ORIGINS: 'http://localhost:3000', AURUM_AUTH_DUMMY_HASH: await hashPassword('unrelated-test-password-123'), AURUM_API_PORT: String(port) };
    assert.equal('MIGRATION_DATABASE_URL' in env, false);
    api = spawn(process.execPath, ['apps/api/dist/main.js'], { cwd: root, env, stdio: 'ignore' });
    const base = `http://127.0.0.1:${port}`; await waitReady(`${base}/health`, api);
    const headers = { origin: 'http://localhost:3000', 'x-aurum-request': '1', 'content-type': 'application/json' };
    const login = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers, body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200); const cookie = login.headers.get('set-cookie')?.split(';')[0]; assert.ok(cookie);
    const scope = `companyId=${companyId}&branchId=${branchId}`;
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?${scope}`, { headers: { cookie } })).status, 403);
    await migration.membershipPermission.create({ data: { companyId, userId, permission: 'tenant.demo.read' } });
    assert.equal((await fetch(`${base}/api/v1/companies`, { headers: { cookie } })).status, 200);
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?${scope}`, { headers: { cookie } })).status, 200);
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?companyId=${realCompanyId}&branchId=${realBranchId}`, { headers: { cookie } })).status, 403);
    await migration.membershipPermission.create({ data: { companyId: realCompanyId, userId, permission: 'tenant.real.read' } });
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?companyId=${realCompanyId}&branchId=${realBranchId}`, { headers: { cookie } })).status, 200);
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?companyId=${realCompanyId}&branchId=${missingBranchId}`, { headers: { cookie } })).status, 403);
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?companyId=${companyId}&branchId=${realBranchId}`, { headers: { cookie } })).status, 403);
    await migration.membershipPermission.delete({ where: { companyId_userId_permission: { companyId, userId, permission: 'tenant.demo.read' } } });
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?${scope}`, { headers: { cookie } })).status, 403);
    assert.equal((await fetch(`${base}/api/v1/hrm/employees?companyId=${realCompanyId}&branchId=${realBranchId}`, { headers: { cookie } })).status, 200);
    await migration.membershipPermission.create({ data: { companyId, userId, permission: 'tenant.demo.read' } });
    const created = await fetch(`${base}/api/v1/hrm/employees`, { method: 'POST', headers: { ...headers, cookie }, body: JSON.stringify({ companyId, branchId, departmentId, code: employeeId.slice(0, 8), fullName: '[TEST] Nhân viên' }) });
    assert.equal(created.status, 201);
    assert.equal(await migration.employee.count({ where: { companyId, departmentId } }), 1);
    const persisted = await migration.employee.findFirstOrThrow({ where: { companyId, departmentId } });
    const changed = await fetch(`${base}/api/v1/hrm/employees/${persisted.id}`, { method: 'PATCH', headers: { ...headers, cookie }, body: JSON.stringify({ companyId, branchId, departmentId, code: persisted.code, fullName: '[TEST] Đã cập nhật' }) });
    assert.equal(changed.status, 200);
    const status = await fetch(`${base}/api/v1/hrm/employees/${persisted.id}/status`, { method: 'PATCH', headers: { ...headers, cookie }, body: JSON.stringify({ companyId, branchId, status: 'inactive' }) });
    assert.equal(status.status, 200);
    assert.equal((await migration.employee.findUniqueOrThrow({ where: { id: persisted.id } })).status, 'inactive');
    assert.equal((await fetch(`${base}/api/v1/hrm/attendances?${scope}`, { headers: { cookie } })).status, 200);
    const rotated = await fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers: { ...headers, cookie }, body: JSON.stringify({ email, password }) });
    assert.equal(rotated.status, 200);
    const rotatedCookie = rotated.headers.get('set-cookie')?.split(';')[0]; assert.ok(rotatedCookie);
    assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie } })).status, 401);
    const concurrent = await Promise.all([1, 2].map(() => fetch(`${base}/api/v1/auth/login`, { method: 'POST', headers, body: JSON.stringify({ email, password }) })));
    assert.deepEqual(concurrent.map(response => response.status), [200, 200]);
    assert.equal((await fetch(`${base}/api/v1/auth/logout`, { method: 'POST', headers: { ...headers, cookie: rotatedCookie } })).status, 204);
    assert.equal((await fetch(`${base}/api/v1/auth/me`, { headers: { cookie: rotatedCookie } })).status, 401);
  } finally {
    api?.kill('SIGTERM');
    await migration.hrmReadAudit.deleteMany({ where: { userId } }); await migration.hrmSecurityAudit.deleteMany({ where: { userId } }); await migration.hrmEmployeeAudit.deleteMany({ where: { userId } });
    await migration.authenticationAudit.deleteMany({ where: { userId } }); await migration.userSession.deleteMany({ where: { userId } });
    await migration.classifiedBranchScope.deleteMany({ where: { companyId: realCompanyId } }); await migration.tenantClassification.deleteMany({ where: { companyId: realCompanyId } });
    await migration.branchGrant.deleteMany({ where: { companyId: realCompanyId, userId } }); await migration.membershipPermission.deleteMany({ where: { companyId: realCompanyId, userId } }); await migration.companyMembership.deleteMany({ where: { companyId: realCompanyId, userId } });
    await migration.branch.deleteMany({ where: { companyId: realCompanyId } }); await migration.company.deleteMany({ where: { id: realCompanyId } });
    await migration.employee.deleteMany({ where: { companyId } }); await migration.classifiedBranchScope.deleteMany({ where: { companyId } }); await migration.tenantClassification.deleteMany({ where: { companyId } });
    await migration.tenantClassification.deleteMany({ where: { companyId: unreferencedCompanyId } }); await migration.company.deleteMany({ where: { id: unreferencedCompanyId } });
    await migration.branchGrant.deleteMany({ where: { companyId, userId } }); await migration.membershipPermission.deleteMany({ where: { companyId, userId } }); await migration.companyMembership.deleteMany({ where: { companyId, userId } });
    await migration.identityUser.deleteMany({ where: { id: userId } }); await migration.department.deleteMany({ where: { companyId } }); await migration.branch.deleteMany({ where: { id: branchId } }); await migration.company.deleteMany({ where: { id: companyId } });
    await runtime.$disconnect(); await migration.$disconnect();
  }
});
