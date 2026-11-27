import { authorizeCompany, type Principal } from '@aurum/access';

export type DepartmentListItem = Readonly<{ id: string; branchId: string; code: string; name: string }>;
export type DepartmentListScope = Readonly<{ companyId: string; branchIds: readonly string[] | null; offset: number; limit: number }>;
export interface ScopedDepartmentReader {
  findPage(scope: DepartmentListScope): Promise<Readonly<{ items: readonly DepartmentListItem[]; total: number }>>;
}
/** The principal must come from a verified session and persistent server-side grants. */
export class ListScopedDepartmentsQuery {
  constructor(readonly principal: Principal | null, readonly companyId: string, readonly branchId: string | null, readonly page: number, readonly pageSize: number) {}
}
export class ListScopedDepartmentsHandler {
  constructor(private readonly reader: ScopedDepartmentReader) {}
  async execute(query: ListScopedDepartmentsQuery): Promise<Readonly<{ items: readonly DepartmentListItem[]; total: number }>> {
    if (!Number.isSafeInteger(query.page) || query.page < 1 || query.page > 10000 || !Number.isSafeInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) throw new Error('Invalid pagination');
    if (!authorizeCompany(query.principal, query.companyId, 'department.read').allowed || !query.principal) throw new Error('Access denied');
    const membership = query.principal.memberships.find(item => item.companyId === query.companyId && item.status === 'active');
    if (!membership) throw new Error('Access denied');
    if (query.branchId && membership.branchIds !== null && !membership.branchIds.includes(query.branchId)) throw new Error('Access denied');
    const branchIds = query.branchId ? [query.branchId] : membership.branchIds;
    if (branchIds !== null && branchIds.length === 0) return { items: [], total: 0 };
    return this.reader.findPage({ companyId: query.companyId, branchIds, offset: (query.page - 1) * query.pageSize, limit: query.pageSize });
  }
}
