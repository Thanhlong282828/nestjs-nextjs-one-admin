import type { DepartmentListScope, ScopedDepartmentReader } from '@aurum/hrm';
import type { PrismaClient } from '../generated/prisma/client';

export class PrismaScopedDepartmentReader implements ScopedDepartmentReader {
  constructor(private readonly db: Pick<PrismaClient, 'department'>) {}
  async findPage(scope: DepartmentListScope) {
    const where = { companyId: scope.companyId, branch: { classifiedScope: { some: {} } }, ...(scope.branchIds !== null ? { branchId: { in: [...scope.branchIds] } } : {}) };
    const [items, total] = await Promise.all([
      this.db.department.findMany({ where, select: { id: true, branchId: true, code: true, name: true }, orderBy: [{ code: 'asc' }, { id: 'asc' }], skip: scope.offset, take: scope.limit }),
      this.db.department.count({ where }),
    ]);
    return { items, total };
  }
}
