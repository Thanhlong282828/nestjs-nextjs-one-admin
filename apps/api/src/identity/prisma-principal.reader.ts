import type { Principal } from '@aurum/access';
import type { PrismaClient } from '../generated/prisma/client';
import type { PrincipalReader } from './http/branch-scope.guard';

/** Loads grants from persisted memberships; never treats membership as a permission. */
export class PrismaPrincipalReader implements PrincipalReader {
  constructor(private readonly db: Pick<PrismaClient, 'identityUser'>) {}

  async findByUserId(userId: string): Promise<Principal | null> {
    const user = await this.db.identityUser.findUnique({
      where: { id: userId },
      select: { id: true, status: true, memberships: { select: { companyId: true, status: true, grants: { select: { branchId: true } }, permissions: { select: { permission: true } } } } },
    });
    if (!user) return null;
    return {
      userId: user.id,
      status: user.status === 'active' ? 'active' : 'disabled',
      memberships: user.memberships.map(membership => ({
        companyId: membership.companyId,
        status: membership.status === 'active' ? 'active' : 'suspended',
        permissions: membership.permissions.map(grant => grant.permission),
        branchIds: membership.grants.map(grant => grant.branchId),
      })),
    };
  }
}
