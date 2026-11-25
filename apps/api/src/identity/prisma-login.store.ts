import { randomUUID } from 'node:crypto';
import type { LoginSession, LoginStore } from '@aurum/identity';
import type { PrismaClient } from '../generated/prisma/client';

/** Internal adapter. No HTTP endpoint is registered. */
export class PrismaLoginStore implements LoginStore {
  constructor(private readonly db: PrismaClient, private readonly createAuditId: () => string = randomUUID) {}

  async recordFailure(at: Date): Promise<void> {
    await this.db.authenticationAudit.create({ data: { id: this.createAuditId(), event: 'login_failure', occurredAt: at } });
  }

  async createSessionIfUnchanged(input: Readonly<{ session: LoginSession; expectedPasswordHash: string; at: Date; previousTokenHash: string | null }>): Promise<boolean> {
    return this.db.$transaction(async tx => {
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM identity_users WHERE id = ${input.session.userId}
          AND BINARY status = BINARY 'active'
          AND BINARY password_hash = BINARY ${input.expectedPasswordHash} FOR UPDATE
      `;
      if (rows.length !== 1) return false;
      if (input.previousTokenHash) {
        const revoked = await tx.userSession.updateMany({ where: { userId: input.session.userId, tokenHash: input.previousTokenHash, revokedAt: null }, data: { revokedAt: input.at } });
        if (revoked.count) await tx.authenticationAudit.create({ data: { id: this.createAuditId(), userId: input.session.userId, event: 'session_rotation', occurredAt: input.at } });
      }
      await tx.userSession.create({ data: input.session });
      await tx.authenticationAudit.create({ data: { id: this.createAuditId(), userId: input.session.userId, event: 'login_success', occurredAt: input.at } });
      return true;
    }, { isolationLevel: 'Serializable' });
  }
}
