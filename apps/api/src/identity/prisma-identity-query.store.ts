import type { CurrentUser, IdentityQueryStore, ActiveSession } from '@aurum/identity';
import type { PrismaClient } from '../generated/prisma/client';

/** Internal adapter; not exposed via HTTP until authentication controls are complete. */
export class PrismaIdentityQueryStore implements IdentityQueryStore {
  constructor(private readonly db: Pick<PrismaClient, 'identityUser' | 'userSession'>) {}

  async findActiveUser(userId: string): Promise<CurrentUser | null> {
    const user = await this.db.identityUser.findUnique({ where: { id: userId }, select: { id: true, email: true, status: true } });
    return user?.status === 'active' ? { id: user.id, email: user.email } : null;
  }

  async findActiveSessions(userId: string, now: Date): Promise<readonly Omit<ActiveSession, 'current'>[]> {
    return this.db.userSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: now }, user: { status: 'active' } },
      select: { id: true, createdAt: true, expiresAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
    });
  }
}
