import { createHash } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hashPassword } from '@aurum/identity';
import { PrismaClient } from '../src/generated/prisma/client';

// The graph is deliberately separate from the older one-record browser fixture.
export const DEMO_082 = Object.freeze({
  companyId: 'b2000000-0000-4000-8000-000000000001',
  userId: 'b2000000-0000-4000-8000-000000000002',
  email: 'admin.082.demo@aurum.invalid',
  provenance: 'aurum-connected-demo-082-v1',
});
const permissions = ['company.read', 'branch.read', 'department.read', 'employee.read', 'employee.create', 'employee.update', 'employee.change-status', 'attendance.read', 'tenant.demo.read'];
export function stableDemoId(kind: string, index: number): string {
  const hex = createHash('sha256').update(`${DEMO_082.provenance}:${kind}:${index}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** The first implementation is locked to a known isolated MySQL test principal. */
export async function provisionConnectedDemo(url: string, password: string, fault?: 'after-employees'): Promise<'created' | 'unchanged'> {
  const target = new URL(url);
  if (process.env.NODE_ENV !== 'test' || target.protocol !== 'mysql:' || target.hostname !== '127.0.0.1' || target.port !== '3308' || target.pathname !== '/aurum_nestjs_test' || target.username !== 'aurum_app_migrator' || target.search || target.hash) throw new Error('Refusing non-test target');
  if (password.length < 16 || Buffer.byteLength(password) > 256) throw new Error('Password must have 16–256 bytes');
  const db = new PrismaClient({ adapter: new PrismaMariaDb({ host: target.hostname, port: 3308, user: target.username, password: decodeURIComponent(target.password), database: 'aurum_nestjs_test', allowPublicKeyRetrieval: true }) });
  try {
    const rows = await db.$queryRaw<Array<{ db: string; principal: string }>>`SELECT DATABASE() AS db, CURRENT_USER() AS principal`;
    if (rows[0]?.db !== 'aurum_nestjs_test' || !rows[0]?.principal.startsWith('aurum_app_migrator@')) throw new Error('Actual database identity mismatch');
    const passwordHash = await hashPassword(password);
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await db.$transaction(async tx => {
          const company = await tx.company.findUnique({ where: { id: DEMO_082.companyId } });
          if (company) {
            const classification = await tx.tenantClassification.findUnique({ where: { companyId: company.id } });
            if (classification?.classification !== 'DEMO' || classification.provenance !== DEMO_082.provenance) throw new Error('DEMO ownership conflict');
            // Never restore user-modified values or recreate deleted records silently.
            const [branches, departments, employees, attendance, user, membership, grants, audit, scopes, perms] = await Promise.all([
              tx.branch.count({ where: { companyId: company.id, id: { in: Array.from({ length: 3 }, (_, i) => stableDemoId('branch', i)) } } }),
              tx.department.count({ where: { companyId: company.id, id: { in: Array.from({ length: 9 }, (_, i) => stableDemoId('department', i)) } } }),
              tx.employee.count({ where: { companyId: company.id, id: { in: Array.from({ length: 30 }, (_, i) => stableDemoId('employee', i)) } } }),
              tx.attendance.count({ where: { companyId: company.id, id: { in: Array.from({ length: 300 }, (_, i) => stableDemoId('attendance', i)) } } }),
              tx.identityUser.findUnique({ where: { id: DEMO_082.userId }, select: { id: true } }),
              tx.companyMembership.findUnique({ where: { companyId_userId: { companyId: company.id, userId: DEMO_082.userId } } }),
              tx.branchGrant.count({ where: { companyId: company.id, userId: DEMO_082.userId, branchId: { in: Array.from({ length: 3 }, (_, i) => stableDemoId('branch', i)) } } }),
              tx.hrmEmployeeAudit.count({ where: { companyId: company.id, action: 'provision', userId: DEMO_082.userId } }),
              tx.classifiedBranchScope.count({ where: { companyId: company.id, classification: 'DEMO', branchId: { in: Array.from({ length: 3 }, (_, i) => stableDemoId('branch', i)) } } }),
              tx.membershipPermission.count({ where: { companyId: company.id, userId: DEMO_082.userId, permission: { in: permissions } } }),
            ]);
            if (branches !== 3 || departments !== 9 || employees !== 30 || attendance !== 300 || !user || !membership || grants !== 3 || audit < 1 || scopes !== 3 || perms !== permissions.length) throw new Error('Existing DEMO graph incomplete or ownership drift; no changes made');
            return 'unchanged';
          }
          await tx.company.create({ data: { id: DEMO_082.companyId, name: '[DEMO] Aurum Connected Workspace' } });
          await tx.tenantClassification.create({ data: { companyId: DEMO_082.companyId, classification: 'DEMO', provenance: DEMO_082.provenance } });
          await tx.identityUser.create({ data: { id: DEMO_082.userId, email: DEMO_082.email, passwordHash } });
          await tx.companyMembership.create({ data: { companyId: DEMO_082.companyId, userId: DEMO_082.userId } });
          await tx.membershipPermission.createMany({ data: permissions.map(permission => ({ companyId: DEMO_082.companyId, userId: DEMO_082.userId, permission })) });
          for (let b = 0; b < 3; b++) {
            const branchId = stableDemoId('branch', b);
            await tx.branch.create({ data: { id: branchId, companyId: DEMO_082.companyId, name: `[DEMO] Chi nhánh ${b + 1}` } });
            await tx.classifiedBranchScope.create({ data: { companyId: DEMO_082.companyId, branchId, classification: 'DEMO' } });
            await tx.branchGrant.create({ data: { companyId: DEMO_082.companyId, branchId, userId: DEMO_082.userId } });
            for (let d = 0; d < 3; d++) {
              const index = b * 3 + d;
              await tx.department.create({ data: { id: stableDemoId('department', index), companyId: DEMO_082.companyId, branchId, code: `DEMO-D${index + 1}`, name: `[DEMO] Phòng ban ${index + 1}` } });
            }
          }
          for (let i = 0; i < 30; i++) {
            const branch = i % 3;
            const department = branch * 3 + (Math.floor(i / 3) % 3);
            await tx.employee.create({ data: { id: stableDemoId('employee', i), companyId: DEMO_082.companyId, branchId: stableDemoId('branch', branch), departmentId: stableDemoId('department', department), code: `DEMO-E${String(i + 1).padStart(3, '0')}`, fullName: `[DEMO] Nhân viên ${String(i + 1).padStart(3, '0')}` } });
          }
          if (fault === 'after-employees') throw new Error('Injected test failure');
          for (let i = 0; i < 300; i++) {
            const employee = Math.floor(i / 10);
            await tx.attendance.create({ data: { id: stableDemoId('attendance', i), companyId: DEMO_082.companyId, branchId: stableDemoId('branch', employee % 3), employeeId: stableDemoId('employee', employee), workDate: new Date(Date.UTC(2026, 0, 5 + i % 10)), status: 'present' } });
          }
          await tx.hrmEmployeeAudit.create({ data: { id: stableDemoId('audit', 0), userId: DEMO_082.userId, companyId: DEMO_082.companyId, branchId: stableDemoId('branch', 0), employeeId: stableDemoId('employee', 0), action: 'provision', after: { classification: 'DEMO', source: DEMO_082.provenance, employees: 30, attendance: 300 } } });
          // Verify persistence and relationships inside the same transaction; any mismatch rolls back.
          const counts = await Promise.all([
            tx.branch.count({ where: { companyId: DEMO_082.companyId } }),
            tx.department.count({ where: { companyId: DEMO_082.companyId } }),
            tx.employee.count({ where: { companyId: DEMO_082.companyId } }),
            tx.attendance.count({ where: { companyId: DEMO_082.companyId } }),
            tx.classifiedBranchScope.count({ where: { companyId: DEMO_082.companyId, classification: 'DEMO' } }),
          ]);
          if (counts.join(',') !== '3,9,30,300,3') throw new Error('Post-provision verification failed; transaction rolled back');
          const orphanCounts = await tx.$queryRaw<Array<{ n: bigint }>>`
            SELECT COUNT(*) AS n FROM hrm_attendance a
            LEFT JOIN hrm_employees e ON e.id = a.employee_id AND e.company_id = a.company_id AND e.branch_id = a.branch_id
            WHERE a.company_id = ${DEMO_082.companyId} AND e.id IS NULL
          `;
          if (Number(orphanCounts[0]?.n) !== 0) throw new Error('Attendance ownership verification failed; transaction rolled back');
          return 'created';
        }, { isolationLevel: 'Serializable', timeout: 30000 });
      } catch (error) {
        if (attempt === 3 || typeof error !== 'object' || error === null || !('code' in error) || (error.code !== 'P2034' && error.code !== 'P2002')) throw error;
      }
    }
    throw new Error('Provisioning retries exhausted');
  } finally { await db.$disconnect(); }
}
