import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { provisionTestDemo } from '../scripts/demo-test-provisioner';

import { manifest } from './demo-fixture';
test('test-only provisioning persists, verifies, detects drift and rolls back its own graph', async () => {
  const raw = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
  if (!raw) throw new Error('Isolated test database required');
  const target = new URL(raw);
  if (target.protocol !== 'mysql:' || target.hostname !== '127.0.0.1' || !['3306', '3307'].includes(target.port) || target.pathname !== '/aurum_nestjs_test' || target.search || target.hash) throw new Error('Invalid test target');
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  const db = new PrismaClient({ adapter: new PrismaMariaDb(raw) });
  try {
    assert.equal((await db.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`)[0]?.db, 'aurum_nestjs_test');
    const bad = new URL(raw); bad.pathname = '/aurum_nestjs';
    await assert.rejects(provisionTestDemo(bad.href, manifest, 'apply'), /Refusing/);
    assert.equal(await db.company.count({ where: { id: manifest.company.id } }), 0);
    assert.ok((await provisionTestDemo(raw, manifest, 'dry-run')).steps.every(step => step.action === 'create'));
    assert.equal(await db.company.count({ where: { id: manifest.company.id } }), 0);
    await assert.rejects(provisionTestDemo(raw, manifest, 'apply', 'after-company'), /Injected transaction failure/);
    assert.equal(await db.company.count({ where: { id: manifest.company.id } }), 0);
    assert.equal(await db.demoOwnership.count({ where: { companyId: manifest.company.id } }), 0);
    const concurrent = await Promise.allSettled([1, 2].map(() => provisionTestDemo(raw, manifest, 'apply')));
    if (concurrent.some(result => result.status === 'rejected')) await provisionTestDemo(raw, manifest, 'rollback');
    assert.equal(concurrent.filter(result => result.status === 'fulfilled').length, 2, JSON.stringify(concurrent.map(result => result.status === 'rejected' ? String(result.reason) : 'ok')));
    assert.equal(await db.demoOwnership.count({ where: { companyId: manifest.company.id } }), 5);
    const counts = await db.$queryRaw<Array<{ companies: bigint; branches: bigint; departments: bigint; employees: bigint; attendance: bigint }>>`SELECT (SELECT COUNT(*) FROM companies WHERE id = ${manifest.company.id}) AS companies, (SELECT COUNT(*) FROM branches WHERE id = ${manifest.branch.id} AND company_id = ${manifest.company.id}) AS branches, (SELECT COUNT(*) FROM hrm_departments WHERE id = ${manifest.department.id} AND company_id = ${manifest.company.id} AND branch_id = ${manifest.branch.id}) AS departments, (SELECT COUNT(*) FROM hrm_employees WHERE id = ${manifest.employee.id} AND department_id = ${manifest.department.id} AND company_id = ${manifest.company.id} AND branch_id = ${manifest.branch.id}) AS employees, (SELECT COUNT(*) FROM hrm_attendance WHERE id = ${manifest.attendance.id} AND employee_id = ${manifest.employee.id} AND company_id = ${manifest.company.id} AND branch_id = ${manifest.branch.id}) AS attendance`;
    assert.deepEqual(Object.values(counts[0] ?? {}).map(Number), [1, 1, 1, 1, 1]);
    const quality = await db.$queryRaw<Array<{ badEmployees: bigint; badAttendance: bigint; duplicateCodes: bigint; missingOwnership: bigint }>>`SELECT
      (SELECT COUNT(*) FROM hrm_employees e LEFT JOIN hrm_departments d ON d.id=e.department_id AND d.company_id=e.company_id AND d.branch_id=e.branch_id WHERE e.company_id=${manifest.company.id} AND (d.id IS NULL OR e.status NOT IN ('active','inactive'))) AS badEmployees,
      (SELECT COUNT(*) FROM hrm_attendance a LEFT JOIN hrm_employees e ON e.id=a.employee_id AND e.company_id=a.company_id AND e.branch_id=a.branch_id WHERE a.company_id=${manifest.company.id} AND e.id IS NULL) AS badAttendance,
      (SELECT COUNT(*) FROM (SELECT code FROM hrm_employees WHERE company_id=${manifest.company.id} GROUP BY code HAVING COUNT(*)>1) duplicates) AS duplicateCodes,
      (SELECT COUNT(*) FROM hrm_employees e LEFT JOIN demo_ownership o ON o.id=e.id AND o.company_id=e.company_id AND o.kind='employee' WHERE e.company_id=${manifest.company.id} AND o.id IS NULL) AS missingOwnership`;
    assert.deepEqual(Object.values(quality[0] ?? {}).map(Number), [0, 0, 0, 0]);
    assert.ok((await provisionTestDemo(raw, manifest, 'apply')).steps.every(step => step.action === 'unchanged'));
    const extraAttendance = '4a000000-0000-4000-8000-000000000006';
    await db.attendance.create({ data: { id: extraAttendance, companyId: manifest.company.id, branchId: manifest.branch.id, employeeId: manifest.employee.id, workDate: new Date('2026-01-03T00:00:00Z'), status: 'present' } });
    try {
      await assert.rejects(provisionTestDemo(raw, manifest, 'rollback'));
      assert.equal(await db.attendance.count({ where: { id: manifest.attendance.id } }), 1);
      assert.equal(await db.demoOwnership.count({ where: { companyId: manifest.company.id } }), 5);
    } finally { await db.attendance.delete({ where: { id: extraAttendance } }); }
    await db.employee.update({ where: { id: manifest.employee.id }, data: { fullName: '[TEST] Changed' } });
    await assert.rejects(provisionTestDemo(raw, manifest, 'rollback'), /conflict/);
    assert.equal(await db.attendance.count({ where: { id: manifest.attendance.id } }), 1);
    await db.employee.update({ where: { id: manifest.employee.id }, data: { fullName: manifest.employee.fullName } });
    await provisionTestDemo(raw, manifest, 'rollback');
    assert.equal(await db.company.count({ where: { id: manifest.company.id } }), 0);
    assert.equal(await db.demoOwnership.count({ where: { companyId: manifest.company.id } }), 0);
    await db.company.create({ data: { id: manifest.company.id, name: 'Unowned test company' } });
    try {
      await assert.rejects(provisionTestDemo(raw, manifest, 'apply'), /Unowned/);
      assert.equal((await db.company.findUnique({ where: { id: manifest.company.id } }))?.name, 'Unowned test company');
      assert.equal(await db.branch.count({ where: { companyId: manifest.company.id } }), 0);
    } finally { await db.company.delete({ where: { id: manifest.company.id } }); }
  } finally {
    if (old === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = old;
    await db.$disconnect();
  }
});
