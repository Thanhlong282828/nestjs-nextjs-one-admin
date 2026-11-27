import type { AttendanceListScope, ScopedAttendanceReader } from '@aurum/hrm';
import type { PrismaClient } from '../generated/prisma/client';

/** Scope is derived by the application handler from server-side permissions. */
export class PrismaScopedAttendanceReader implements ScopedAttendanceReader {
  constructor(private readonly db: Pick<PrismaClient, 'attendance'>) {}
  async findPage(scope: AttendanceListScope) {
    const where = { companyId: scope.companyId, employee: { department: { branch: { classifiedScope: { some: {} } } } }, ...(scope.branchIds !== null ? { branchId: { in: [...scope.branchIds] } } : {}), ...(scope.from || scope.to ? { workDate: { ...(scope.from ? { gte: scope.from } : {}), ...(scope.to ? { lte: scope.to } : {}) } } : {}) };
    const [items, total] = await Promise.all([
      this.db.attendance.findMany({ where, select: { id: true, branchId: true, employeeId: true, workDate: true, status: true }, orderBy: [{ workDate: 'desc' }, { id: 'asc' }], skip: scope.offset, take: scope.limit }),
      this.db.attendance.count({ where }),
    ]);
    return { items, total };
  }
}
