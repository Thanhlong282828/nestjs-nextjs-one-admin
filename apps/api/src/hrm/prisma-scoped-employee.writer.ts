import { randomUUID } from 'node:crypto';
import type { EmployeeActor, PreparedEmployee, ScopedEmployeeRecord, ScopedEmployeeWriter } from '@aurum/hrm';
import type { Prisma, PrismaClient } from '../generated/prisma/client';
import { PrismaPrincipalReader } from '../identity/prisma-principal.reader';
import { hasClassifiedBranchAccess } from '../identity/classified-access';

export class EmployeeWriteDeniedError extends Error {}
export class EmployeeWriteInvalidError extends Error {}

type Transaction = Prisma.TransactionClient;

/** Never accepts a client-supplied principal; all scope and permissions are reloaded in the transaction. */
export class PrismaScopedEmployeeWriter implements ScopedEmployeeWriter {
  constructor(private readonly db: PrismaClient) {}

  private async authorize(tx: Transaction, actor: EmployeeActor, companyId: string, branchId: string, permission: string): Promise<void> {
    const session = await tx.userSession.findFirst({ where: { id: actor.sessionId, userId: actor.userId, revokedAt: null, expiresAt: { gt: new Date() }, user: { status: 'active' } }, select: { id: true } });
    const principal = session ? await new PrismaPrincipalReader(tx).findByUserId(actor.userId) : null;
    const branch = await tx.branch.findUnique({ where: { companyId_id: { companyId, id: branchId } }, select: { id: true, companyId: true } });
    if (!session || !principal || !branch || !await hasClassifiedBranchAccess(tx, principal, companyId, branch, permission)) throw new EmployeeWriteDeniedError('Access denied');
  }

  private async department(tx: Transaction, employee: PreparedEmployee): Promise<void> {
    const department = await tx.department.findFirst({ where: { id: employee.departmentId, companyId: employee.companyId, branchId: employee.branchId }, select: { id: true } });
    if (!department) throw new EmployeeWriteInvalidError('Invalid department');
  }

  async create(actor: EmployeeActor, employee: PreparedEmployee): Promise<ScopedEmployeeRecord> {
    return this.db.$transaction(async tx => {
      await this.authorize(tx, actor, employee.companyId, employee.branchId, 'employee.create');
      await this.department(tx, employee);
      const created = await tx.employee.create({ data: { id: randomUUID(), ...employee, status: 'active' } });
      await tx.hrmEmployeeAudit.create({ data: { userId: actor.userId, companyId: created.companyId, branchId: created.branchId, employeeId: created.id, action: 'create', after: created } });
      return created;
    }, { isolationLevel: 'Serializable' });
  }

  async update(actor: EmployeeActor, employeeId: string, employee: PreparedEmployee): Promise<ScopedEmployeeRecord> {
    return this.db.$transaction(async tx => {
      await this.authorize(tx, actor, employee.companyId, employee.branchId, 'employee.update');
      const before = await tx.employee.findFirst({ where: { id: employeeId, companyId: employee.companyId, branchId: employee.branchId } });
      if (!before) throw new EmployeeWriteDeniedError('Access denied');
      if (before.status !== 'active' && before.status !== 'inactive') throw new EmployeeWriteInvalidError('Unsupported current status');
      await this.department(tx, employee);
      const after = await tx.employee.update({ where: { id: employeeId }, data: { code: employee.code, fullName: employee.fullName, departmentId: employee.departmentId } });
      await tx.hrmEmployeeAudit.create({ data: { userId: actor.userId, companyId: before.companyId, branchId: before.branchId, employeeId, action: 'update', before, after } });
      return after;
    }, { isolationLevel: 'Serializable' });
  }

  async changeStatus(actor: EmployeeActor, employeeId: string, companyId: string, branchId: string, status: 'active' | 'inactive'): Promise<ScopedEmployeeRecord> {
    return this.db.$transaction(async tx => {
      await this.authorize(tx, actor, companyId, branchId, 'employee.change-status');
      const before = await tx.employee.findFirst({ where: { id: employeeId, companyId, branchId } });
      if (!before) throw new EmployeeWriteDeniedError('Access denied');
      if ((before.status !== 'active' && before.status !== 'inactive') || before.status === status) throw new EmployeeWriteInvalidError('Invalid status transition');
      const after = await tx.employee.update({ where: { id: employeeId }, data: { status } });
      await tx.hrmEmployeeAudit.create({ data: { userId: actor.userId, companyId, branchId, employeeId, action: 'status', before, after } });
      return after;
    }, { isolationLevel: 'Serializable' });
  }
}
