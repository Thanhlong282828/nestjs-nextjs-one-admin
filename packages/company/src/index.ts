import { authorizeCompany, type Principal } from '@aurum/access';

export type CompanyView = Readonly<{ id: string; name: string }>;
export interface CompanyReader {
  /** Must scope by ID in the database query, not filter after fetching all tenants. */
  findById(id: string): Promise<CompanyView | null>;
}

export type CompanyPage = Readonly<{ items: readonly CompanyView[]; total: number }>;
export type CompanyListCriteria = Readonly<{ allowedCompanyIds: readonly string[]; search: string; offset: number; limit: number }>;
export interface CompanyListReader {
  /** Apply allowedCompanyIds in the database WHERE clause before pagination and count. */
  findPage(criteria: CompanyListCriteria): Promise<CompanyPage>;
}

/** Principal is server-loaded from a verified session, never assembled from request input. */
export class ListCompaniesQuery {
  constructor(readonly principal: Principal | null, readonly search: string, readonly page: number, readonly pageSize: number) {}
}

export class ListCompaniesQueryHandler {
  constructor(private readonly companies: CompanyListReader) {}

  async execute(query: ListCompaniesQuery): Promise<CompanyPage> {
    if (typeof query.search !== 'string' || query.search.length > 100 || !Number.isSafeInteger(query.page) || query.page < 1 || query.page > 10000 || !Number.isSafeInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) throw new Error('Invalid company list criteria');
    const principal = query.principal;
    if (!principal) return { items: [], total: 0 };
    const allowedCompanyIds = [...new Set(principal.memberships.map(m => m.companyId))].filter(id => authorizeCompany(principal, id, 'company.read').allowed);
    if (allowedCompanyIds.length === 0) return { items: [], total: 0 };
    return this.companies.findPage({ allowedCompanyIds, search: query.search.trim(), offset: (query.page - 1) * query.pageSize, limit: query.pageSize });
  }
}

/** principal must be constructed from a verified session and current server-side permissions. */
export class GetCompanyQuery {
  constructor(readonly principal: Principal | null, readonly companyId: string) {}
}

export class GetCompanyQueryHandler {
  constructor(private readonly companies: CompanyReader) {}

  async execute(query: GetCompanyQuery): Promise<CompanyView | null> {
    if (!authorizeCompany(query.principal, query.companyId, 'company.read').allowed) return null;
    return this.companies.findById(query.companyId);
  }
}
