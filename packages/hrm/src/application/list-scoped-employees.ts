import { authorizeCompany, type Principal } from '@aurum/access';

export type EmployeeListItem = Readonly<{ id: string; branchId: string; departmentId: string; code: string; fullName: string; status: string }>;
export type EmployeeListScope = Readonly<{ companyId: string; branchIds: readonly string[] | null; departmentId?: string; employeeId?: string; search?: string; sort?: 'code' | 'name'; direction?: 'asc' | 'desc'; offset: number; limit: number }>;
export interface ScopedEmployeeReader {
  findPage(scope: EmployeeListScope): Promise<Readonly<{ items: readonly EmployeeListItem[]; total: number }>>;
}
/** Principal must be loaded by the server from a verified session and permission store. */
export class ListScopedEmployeesQuery {
  constructor(readonly principal: Principal | null, readonly companyId: string, readonly branchId: string | null, readonly departmentId: string | null, readonly page: number, readonly pageSize: number, readonly options: Readonly<{ employeeId?: string; search?: string; sort?: 'code' | 'name'; direction?: 'asc' | 'desc' }> = {}) {}
}
export class ListScopedEmployeesHandler {
  constructor(private readonly reader: ScopedEmployeeReader) {}
  async execute(query: ListScopedEmployeesQuery): Promise<Readonly<{ items: readonly EmployeeListItem[]; total: number }>> {
    if (!Number.isSafeInteger(query.page) || query.page < 1 || query.page > 10000 || !Number.isSafeInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) throw new Error('Invalid pagination');
    if (query.options.search !== undefined && (typeof query.options.search !== 'string' || query.options.search.length > 100)) throw new Error('Invalid search');
    if (query.options.sort !== undefined && !['code', 'name'].includes(query.options.sort)) throw new Error('Invalid sort');
    if (query.options.direction !== undefined && !['asc', 'desc'].includes(query.options.direction)) throw new Error('Invalid direction');
    if (!authorizeCompany(query.principal, query.companyId, 'employee.read').allowed || !query.principal) throw new Error('Access denied');
    const membership = query.principal.memberships.find(item => item.companyId === query.companyId && item.status === 'active');
    if (!membership) throw new Error('Access denied');
    const permitted = membership.branchIds;
    if (query.branchId && permitted !== null && !permitted.includes(query.branchId)) throw new Error('Access denied');
    const branchIds = query.branchId ? [query.branchId] : permitted;
    if (branchIds !== null && branchIds.length === 0) return { items: [], total: 0 };
    return this.reader.findPage({ companyId: query.companyId, branchIds, ...(query.departmentId ? { departmentId: query.departmentId } : {}), ...query.options, offset: (query.page - 1) * query.pageSize, limit: query.pageSize });
  }
}
