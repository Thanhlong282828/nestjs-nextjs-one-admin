import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ListCompaniesQuery, ListCompaniesQueryHandler, ListBranchesQuery, ListBranchesQueryHandler } from '@aurum/company';
import type { PrincipalReader } from '../identity/http/branch-scope.guard';
import type { PrismaClient } from '../generated/prisma/client';
import { authorizeCompany, type Principal } from '@aurum/access';

export class CompanyHttpService {
  constructor(private readonly principals: PrincipalReader, private readonly companies: ListCompaniesQueryHandler, private readonly branches: ListBranchesQueryHandler, private readonly db: Pick<PrismaClient, 'tenantClassification'>) {}
  private async classified(principal: Principal): Promise<Principal> {
    const records = await this.db.tenantClassification.findMany({ where: { companyId: { in: principal.memberships.map(m => m.companyId) } } });
    const allowed = new Set(records.filter(record => {
      if ((record.classification !== 'REAL' && record.classification !== 'DEMO') || !record.provenance.trim() || (record.classification === 'REAL' && !record.sourceReference?.trim())) return false;
      return authorizeCompany(principal, record.companyId, record.classification === 'REAL' ? 'tenant.real.read' : 'tenant.demo.read').allowed;
    }).map(record => record.companyId));
    return { ...principal, memberships: principal.memberships.filter(m => allowed.has(m.companyId)) };
  }
  async listCompanies(userId: string, page: unknown, pageSize: unknown, search: unknown) {
    const number = (value: unknown, fallback: number) => value === undefined ? fallback : typeof value === 'string' && /^[1-9]\d{0,4}$/.test(value) ? Number(value) : NaN;
    const p = number(page, 1), size = number(pageSize, 20);
    if (!Number.isSafeInteger(p) || p > 10000 || !Number.isSafeInteger(size) || size > 100 || (search !== undefined && (typeof search !== 'string' || search.length > 100))) throw new BadRequestException();
    const principal = await this.principals.findByUserId(userId);
    if (!principal || principal.userId !== userId || principal.status !== 'active') throw new UnauthorizedException();
    return this.companies.execute(new ListCompaniesQuery(await this.classified(principal), typeof search === 'string' ? search : '', p, size));
  }
  async listBranches(userId: string, companyId: unknown, page: unknown, pageSize: unknown) {
    if (typeof companyId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId)) throw new BadRequestException();
    const number = (value: unknown, fallback: number) => value === undefined ? fallback : typeof value === 'string' && /^[1-9]\d{0,4}$/.test(value) ? Number(value) : NaN;
    const p = number(page, 1), size = number(pageSize, 20);
    if (!Number.isSafeInteger(p) || p > 10000 || !Number.isSafeInteger(size) || size > 100) throw new BadRequestException();
    const principal = await this.principals.findByUserId(userId);
    if (!principal || principal.userId !== userId || principal.status !== 'active') throw new UnauthorizedException();
    const result = await this.branches.execute(new ListBranchesQuery(await this.classified(principal), companyId, p, size));
    if (!result) throw new ForbiddenException();
    return { items: result };
  }
}
