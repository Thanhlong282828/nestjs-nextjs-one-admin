import type { PrismaClient } from '../generated/prisma/client';
import type { BranchReader } from './http/branch-scope.guard';

/** Never resolve a branch without its company; requested scope is still subject to authorization. */
export class PrismaBranchReader implements BranchReader {
  constructor(private readonly db: Pick<PrismaClient, 'branch'>) {}
  findByCompanyAndId(companyId: string, branchId: string): Promise<Readonly<{ id: string; companyId: string }> | null> {
    return this.db.branch.findUnique({ where: { companyId_id: { companyId, id: branchId } }, select: { id: true, companyId: true } });
  }
}
