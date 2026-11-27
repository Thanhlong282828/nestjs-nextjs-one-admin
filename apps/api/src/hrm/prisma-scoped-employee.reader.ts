import type { EmployeeListScope, ScopedEmployeeReader } from '@aurum/hrm';
import type { PrismaClient } from '../generated/prisma/client';

/** The query handler supplies scope derived from trusted server-side permissions. */
export class PrismaScopedEmployeeReader implements ScopedEmployeeReader {
  constructor(private readonly db: Pick<PrismaClient, 'employee'>) {}
  async findPage(scope: EmployeeListScope) {
    const where = { companyId: scope.companyId, department: { branch: { classifiedScope: { some: {} } } }, ...(scope.branchIds !== null ? { branchId: { in: [...scope.branchIds] } } : {}), ...(scope.departmentId ? { departmentId: scope.departmentId } : {}), ...(scope.employeeId ? { id: scope.employeeId } : {}), ...(scope.search ? { OR: [{ code: { contains: scope.search } }, { fullName: { contains: scope.search } }] } : {}) };
    const direction = scope.direction ?? 'asc';
    const orderBy = scope.sort === 'name' ? [{ fullName: direction }, { id: 'asc' as const }] : [{ code: direction }, { id: 'asc' as const }];
    const [items, total] = await Promise.all([
      this.db.employee.findMany({ where, select: { id: true, branchId: true, departmentId: true, code: true, fullName: true, status: true }, orderBy, skip: scope.offset, take: scope.limit }),
      this.db.employee.count({ where }),
    ]);
    return { items, total };
  }
}
