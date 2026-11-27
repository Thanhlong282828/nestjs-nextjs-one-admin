import type { BranchListReader, BranchView } from '@aurum/company';
import type { PrismaClient } from '../generated/prisma/client';

export class PrismaBranchListReader implements BranchListReader {
  constructor(private readonly db: Pick<PrismaClient, 'branch'>) {}
  findAuthorized(companyId: string, userId: string, branchIds: readonly string[] | null, offset: number, limit: number): Promise<readonly BranchView[]> {
    return this.db.branch.findMany({ where: { companyId, classifiedScope: { some: {} }, ...(branchIds === null ? {} : { id: { in: [...branchIds] } }), grants: { some: { userId, membership: { status: 'active', user: { status: 'active' }, permissions: { some: { permission: 'branch.read' } } } } } }, select: { id: true, companyId: true, name: true }, orderBy: [{ name: 'asc' }, { id: 'asc' }], skip: offset, take: limit });
  }
}
