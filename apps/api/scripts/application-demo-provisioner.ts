import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hashPassword, verifyPassword } from '@aurum/identity';
import { PrismaClient } from '../src/generated/prisma/client';

/** Fixed synthetic tenant created by this provisioner only; never adopts existing companies. */
export const DEMO = Object.freeze({
  companyId: 'b1000000-0000-4000-8000-000000000001', branchId: 'b1000000-0000-4000-8000-000000000002',
  departmentId: 'b1000000-0000-4000-8000-000000000003', employeeId: 'b1000000-0000-4000-8000-000000000004',
  attendanceId: 'b1000000-0000-4000-8000-000000000005', userId: 'b1000000-0000-4000-8000-000000000006',
  auditId: 'b1000000-0000-4000-8000-000000000007', email: 'demo.viewer@aurum.invalid', provenance: 'aurum-local-demo-provisioner-v1',
});
const permissions = ['company.read', 'branch.read', 'department.read', 'employee.read', 'attendance.read', 'tenant.demo.read'];

/** Restricted to isolated test servers; never accepts a client-supplied DB instance. */
export async function provisionApplicationDemo(url: string, password: string, testFault?: 'after-employee'): Promise<'created' | 'unchanged'> {
  const target = new URL(url);
  const testPrincipal = (target.port === '3308' && target.username === 'aurum_app_migrator') || (target.port === '3307' && target.username === 'aurum_migrate_test');
  if (process.env.NODE_ENV !== 'test' || target.protocol !== 'mysql:' || target.hostname !== '127.0.0.1' || !testPrincipal || target.pathname !== '/aurum_nestjs_test' || target.search || target.hash) throw new Error('Refusing non-test target');
  if (password.length < 16 || Buffer.byteLength(password) > 256) throw new Error('Password must have at least 16 characters');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  try {
    const selected = await db.$queryRaw<Array<{ databaseName: string }>>`SELECT DATABASE() AS databaseName`;
    if (selected[0]?.databaseName !== 'aurum_nestjs_test') throw new Error('Database identity mismatch');
    const passwordHash = await hashPassword(password);
    for (let attempt = 0; attempt < 4; attempt++) {
      try { return await db.$transaction(async tx => {
      const company = await tx.company.findUnique({ where: { id: DEMO.companyId } });
      if (company) {
        const [classification, branch, scope, department, employee, attendance, user, membership, grant, perms, audit] = await Promise.all([
          tx.tenantClassification.findUnique({ where: { companyId: DEMO.companyId } }),
          tx.branch.findUnique({ where: { id: DEMO.branchId } }),
          tx.classifiedBranchScope.findUnique({ where: { companyId_branchId: { companyId: DEMO.companyId, branchId: DEMO.branchId } } }),
          tx.department.findUnique({ where: { id: DEMO.departmentId } }), tx.employee.findUnique({ where: { id: DEMO.employeeId } }),
          tx.attendance.findUnique({ where: { id: DEMO.attendanceId } }), tx.identityUser.findUnique({ where: { id: DEMO.userId } }),
          tx.companyMembership.findUnique({ where: { companyId_userId: { companyId: DEMO.companyId, userId: DEMO.userId } } }),
          tx.branchGrant.findUnique({ where: { companyId_userId_branchId: { companyId: DEMO.companyId, userId: DEMO.userId, branchId: DEMO.branchId } } }),
          tx.membershipPermission.findMany({ where: { companyId: DEMO.companyId, userId: DEMO.userId }, select: { permission: true } }),
          tx.hrmEmployeeAudit.findUnique({ where: { id: DEMO.auditId } }),
        ]);
        if (company.name !== '[DEMO] Aurum Workspace' || classification?.classification !== 'DEMO' || classification.provenance !== DEMO.provenance || branch?.companyId !== DEMO.companyId || branch.name !== '[DEMO] Chi nhánh trung tâm' || scope?.classification !== 'DEMO' || department?.companyId !== DEMO.companyId || department.branchId !== DEMO.branchId || department.code !== 'DEMO-OPS' || department.name !== '[DEMO] Vận hành' || employee?.companyId !== DEMO.companyId || employee.branchId !== DEMO.branchId || employee.departmentId !== DEMO.departmentId || employee.code !== 'DEMO-001' || employee.fullName !== '[DEMO] Nhân viên mẫu' || employee.status !== 'active' || attendance?.companyId !== DEMO.companyId || attendance.branchId !== DEMO.branchId || attendance.employeeId !== DEMO.employeeId || attendance.workDate.toISOString().slice(0, 10) !== '2026-01-02' || attendance.status !== 'present' || user?.email !== DEMO.email || user.status !== 'active' || !await verifyPassword(user.passwordHash, password) || membership?.status !== 'active' || !grant || perms.length !== permissions.length || permissions.some(p => !perms.some(row => row.permission === p)) || audit?.action !== 'provision' || audit.employeeId !== DEMO.employeeId || audit.companyId !== DEMO.companyId || audit.branchId !== DEMO.branchId || audit.userId !== DEMO.userId) throw new Error('Existing DEMO graph is incomplete or conflicts; no changes made');
        return 'unchanged' as const;
      }
      await tx.company.create({ data: { id: DEMO.companyId, name: '[DEMO] Aurum Workspace' } });
      await tx.tenantClassification.create({ data: { companyId: DEMO.companyId, classification: 'DEMO', provenance: DEMO.provenance } });
      await tx.branch.create({ data: { id: DEMO.branchId, companyId: DEMO.companyId, name: '[DEMO] Chi nhánh trung tâm' } });
      await tx.classifiedBranchScope.create({ data: { companyId: DEMO.companyId, branchId: DEMO.branchId, classification: 'DEMO' } });
      await tx.department.create({ data: { id: DEMO.departmentId, companyId: DEMO.companyId, branchId: DEMO.branchId, code: 'DEMO-OPS', name: '[DEMO] Vận hành' } });
      await tx.employee.create({ data: { id: DEMO.employeeId, companyId: DEMO.companyId, branchId: DEMO.branchId, departmentId: DEMO.departmentId, code: 'DEMO-001', fullName: '[DEMO] Nhân viên mẫu' } });
      if (testFault === 'after-employee') throw new Error('Injected isolated test failure');
      await tx.attendance.create({ data: { id: DEMO.attendanceId, companyId: DEMO.companyId, branchId: DEMO.branchId, employeeId: DEMO.employeeId, workDate: new Date('2026-01-02T00:00:00Z'), status: 'present' } });
      await tx.identityUser.create({ data: { id: DEMO.userId, email: DEMO.email, passwordHash } });
      await tx.companyMembership.create({ data: { companyId: DEMO.companyId, userId: DEMO.userId } });
      await tx.branchGrant.create({ data: { companyId: DEMO.companyId, userId: DEMO.userId, branchId: DEMO.branchId } });
      await tx.membershipPermission.createMany({ data: permissions.map(permission => ({ companyId: DEMO.companyId, userId: DEMO.userId, permission })) });
      await tx.hrmEmployeeAudit.create({ data: { id: DEMO.auditId, userId: DEMO.userId, companyId: DEMO.companyId, branchId: DEMO.branchId, employeeId: DEMO.employeeId, action: 'provision', after: { classification: 'DEMO', source: DEMO.provenance } } });
      return 'created' as const;
      }, { isolationLevel: 'Serializable' }); }
      catch (error) {
        if (attempt === 3 || typeof error !== 'object' || error === null || !('code' in error) || (error.code !== 'P2034' && error.code !== 'P2002')) throw error;
      }
    }
    throw new Error('Provisioning retries exhausted');
  } finally { await db.$disconnect(); }
}
