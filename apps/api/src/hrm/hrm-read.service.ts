import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ListScopedEmployeesHandler, ListScopedEmployeesQuery, ListScopedDepartmentsHandler, ListScopedDepartmentsQuery, ListScopedAttendanceHandler, ListScopedAttendanceQuery } from '@aurum/hrm';
import type { PrismaClient } from '../generated/prisma/client';
import type { AuthenticatedSession } from '../identity/http/session.guard';
import { PrismaPrincipalReader } from '../identity/prisma-principal.reader';
import { hasClassifiedBranchAccess } from '../identity/classified-access';
import { PrismaScopedEmployeeReader } from './prisma-scoped-employee.reader';
import { PrismaScopedDepartmentReader } from './prisma-scoped-department.reader';
import { PrismaScopedAttendanceReader } from './prisma-scoped-attendance.reader';

type Resource = 'employees' | 'departments' | 'attendance';
type Input = Readonly<{ companyId?: unknown; branchId?: unknown; page?: unknown; pageSize?: unknown; departmentId?: unknown; from?: unknown; to?: unknown; search?: unknown; sort?: unknown; direction?: unknown; employeeId?: unknown }>;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validates scope and writes audit in the same transaction before returning private data. */
export class HrmReadService {
  constructor(private readonly db: PrismaClient) {}
  async list(actor: AuthenticatedSession, resource: Resource, input: Input) {
    const { companyId, branchId } = input;
    if (typeof companyId !== 'string' || !uuid.test(companyId) || typeof branchId !== 'string' || !uuid.test(branchId)) throw new BadRequestException();
    const positive = (v: unknown, fallback: number) => v === undefined ? fallback : typeof v === 'string' && /^[1-9]\d{0,4}$/.test(v) ? Number(v) : NaN;
    const page = positive(input.page, 1), pageSize = positive(input.pageSize, 20);
    if (!Number.isSafeInteger(page) || page > 10000 || !Number.isSafeInteger(pageSize) || pageSize > 100) throw new BadRequestException();
    if (input.departmentId !== undefined && (typeof input.departmentId !== 'string' || !uuid.test(input.departmentId))) throw new BadRequestException();
    if (input.employeeId !== undefined && (typeof input.employeeId !== 'string' || !uuid.test(input.employeeId))) throw new BadRequestException();
    if (input.search !== undefined && (typeof input.search !== 'string' || input.search.length > 100)) throw new BadRequestException();
    if (input.sort !== undefined && input.sort !== 'code' && input.sort !== 'name') throw new BadRequestException();
    if (input.direction !== undefined && input.direction !== 'asc' && input.direction !== 'desc') throw new BadRequestException();
    for (const date of [input.from, input.to]) if (date !== undefined && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date)) throw new BadRequestException();
    if (typeof input.from === 'string' && typeof input.to === 'string' && input.from > input.to) throw new BadRequestException();
    const permission = resource === 'employees' ? 'employee.read' : resource === 'departments' ? 'department.read' : 'attendance.read';
    return this.db.$transaction(async tx => {
      const session = await tx.userSession.findFirst({ where: { id: actor.sessionId, userId: actor.userId, revokedAt: null, expiresAt: { gt: new Date() }, user: { status: 'active' } }, select: { id: true } });
      if (!session) throw new UnauthorizedException();
      const principal = await new PrismaPrincipalReader(tx).findByUserId(actor.userId);
      const branch = await tx.branch.findUnique({ where: { companyId_id: { companyId, id: branchId } }, select: { id: true, companyId: true } });
      if (!principal || principal.userId !== actor.userId || !branch || !await hasClassifiedBranchAccess(tx, principal, companyId, branch, permission)) throw new ForbiddenException();
      await tx.hrmReadAudit.create({ data: { userId: actor.userId, companyId, branchId, resource } });
      if (resource === 'employees') return new ListScopedEmployeesHandler(new PrismaScopedEmployeeReader(tx)).execute(new ListScopedEmployeesQuery(principal, companyId, branchId, typeof input.departmentId === 'string' ? input.departmentId : null, page, pageSize, { ...(typeof input.employeeId === 'string' ? { employeeId: input.employeeId } : {}), ...(typeof input.search === 'string' && input.search.trim() ? { search: input.search.trim() } : {}), ...(input.sort === 'code' || input.sort === 'name' ? { sort: input.sort } : {}), ...(input.direction === 'asc' || input.direction === 'desc' ? { direction: input.direction } : {}) }));
      if (resource === 'departments') return new ListScopedDepartmentsHandler(new PrismaScopedDepartmentReader(tx)).execute(new ListScopedDepartmentsQuery(principal, companyId, branchId, page, pageSize));
      return new ListScopedAttendanceHandler(new PrismaScopedAttendanceReader(tx)).execute(new ListScopedAttendanceQuery(principal, companyId, branchId, typeof input.from === 'string' ? input.from : null, typeof input.to === 'string' ? input.to : null, page, pageSize));
    }, { isolationLevel: 'Serializable' });
  }
}
