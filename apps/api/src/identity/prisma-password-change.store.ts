import type { PasswordChangeStore } from '@aurum/identity';
import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '../generated/prisma/client';

/** Internal adapter; not registered in Nest or exposed through HTTP. */
export class PrismaPasswordChangeStore implements PasswordChangeStore {
  constructor(private readonly db: PrismaClient, private readonly createAuditId: () => string = randomUUID) {}

  async findActivePasswordHash(userId: string): Promise<string | null> {
    const user = await this.db.identityUser.findUnique({ where: { id: userId }, select: { status: true, passwordHash: true } });
    return user?.status === 'active' ? user.passwordHash : null;
  }

  async replaceAndRevoke(input: Readonly<{ userId: string; sessionId: string; previousHash: string; nextHash: string; at: Date }>): Promise<boolean> {
    return this.db.$transaction(async tx => {
      // Password hashes are case-sensitive even when the MySQL table collation is not.
      const updated = await tx.$executeRaw`
        UPDATE identity_users SET password_hash = ${input.nextHash}
        WHERE id = ${input.userId} AND BINARY status = BINARY 'active'
          AND BINARY password_hash = BINARY ${input.previousHash}
          AND EXISTS (SELECT 1 FROM identity_sessions
            WHERE id = ${input.sessionId} AND user_id = ${input.userId}
              AND revoked_at IS NULL AND expires_at > ${input.at})
      `;
      if (updated !== 1) return false;
      await tx.userSession.updateMany({ where: { userId: input.userId, revokedAt: null }, data: { revokedAt: input.at } });
      await tx.authenticationAudit.create({ data: { id: this.createAuditId(), userId: input.userId, event: 'password_change', occurredAt: input.at } });
      return true;
    }, { isolationLevel: 'Serializable' });
  }
}
