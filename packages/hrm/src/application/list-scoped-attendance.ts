import { authorizeCompany, type Principal } from '@aurum/access';

export type AttendanceListItem = Readonly<{ id: string; branchId: string; employeeId: string; workDate: Date; status: string }>;
export type AttendanceListScope = Readonly<{ companyId: string; branchIds: readonly string[] | null; from?: Date; to?: Date; offset: number; limit: number }>;
export interface ScopedAttendanceReader {
  findPage(scope: AttendanceListScope): Promise<Readonly<{ items: readonly AttendanceListItem[]; total: number }>>;
}

function parseDate(value: string | null): Date | undefined {
  if (value === null) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid date');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) throw new Error('Invalid date');
  return date;
}

/** The principal must be derived from a verified session and server-side grants. */
export class ListScopedAttendanceQuery {
  constructor(readonly principal: Principal | null, readonly companyId: string, readonly branchId: string | null, readonly from: string | null, readonly to: string | null, readonly page: number, readonly pageSize: number) {}
}
export class ListScopedAttendanceHandler {
  constructor(private readonly reader: ScopedAttendanceReader) {}
  async execute(query: ListScopedAttendanceQuery): Promise<Readonly<{ items: readonly AttendanceListItem[]; total: number }>> {
    if (!Number.isSafeInteger(query.page) || query.page < 1 || query.page > 10000 || !Number.isSafeInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) throw new Error('Invalid pagination');
    if (!authorizeCompany(query.principal, query.companyId, 'attendance.read').allowed || !query.principal) throw new Error('Access denied');
    const membership = query.principal.memberships.find(item => item.companyId === query.companyId && item.status === 'active');
    if (!membership) throw new Error('Access denied');
    if (query.branchId && membership.branchIds !== null && !membership.branchIds.includes(query.branchId)) throw new Error('Access denied');
    const from = parseDate(query.from), to = parseDate(query.to);
    if (from && to && from > to) throw new Error('Invalid date range');
    const branchIds = query.branchId ? [query.branchId] : membership.branchIds;
    if (branchIds !== null && branchIds.length === 0) return { items: [], total: 0 };
    return this.reader.findPage({ companyId: query.companyId, branchIds, ...(from ? { from } : {}), ...(to ? { to } : {}), offset: (query.page - 1) * query.pageSize, limit: query.pageSize });
  }
}
