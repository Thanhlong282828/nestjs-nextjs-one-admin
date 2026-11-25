import type { SessionRecord, SessionState, SessionStore } from '@aurum/identity';
import type { PrismaClient } from '../generated/prisma/client';

/** Adapter only; no controller or login flow is exposed. */
export class PrismaSessionStore implements SessionStore {
  constructor(private readonly db: Pick<PrismaClient, 'userSession'>) {}

  async create(record: SessionRecord): Promise<void> {
    await this.db.userSession.create({ data: record });
  }

  async findByTokenHash(tokenHash: string): Promise<SessionState | null> {
    const row = await this.db.userSession.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, tokenHash: true, expiresAt: true, revokedAt: true, user: { select: { status: true } } },
    });
    if (!row) return null;
    return { id: row.id, userId: row.userId, tokenHash: row.tokenHash, expiresAt: row.expiresAt, revokedAt: row.revokedAt, userStatus: row.user.status === 'active' ? 'active' : 'disabled' };
  }

  async revokeByIdForUser(id: string, userId: string, at: Date): Promise<boolean> {
    const result = await this.db.userSession.updateMany({ where: { id, userId, revokedAt: null }, data: { revokedAt: at } });
    return result.count === 1;
  }

  async revokeAllForUser(userId: string, at: Date): Promise<number> {
    const result = await this.db.userSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: at } });
    return result.count;
  }
}
