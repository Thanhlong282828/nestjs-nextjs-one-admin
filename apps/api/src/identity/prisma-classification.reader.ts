import type { PrismaClient } from '../generated/prisma/client';

/** Candidate reader for scoped classification; callers must supply server-derived scope. */
export class PrismaClassificationReader {
  constructor(private readonly db: Pick<PrismaClient, 'classifiedBranchScope'>) {}
  async findByCompanyAndBranch(companyId: string, branchId: string) {
    const scope = await this.db.classifiedBranchScope.findUnique({
      where: { companyId_branchId: { companyId, branchId } },
      select: { companyId: true, branchId: true, classification: true, tenant: { select: { companyId: true, classification: true, provenance: true, sourceReference: true } } },
    });
    if (!scope || scope.classification !== scope.tenant.classification) return null;
    return scope.tenant;
  }
}
