import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '../generated/prisma/client';
import { PrismaSessionStore } from './prisma-session.store';

/** Internal adapter; revoke and audit must commit together. No HTTP registration. */
export class PrismaAuditedSessionStore extends PrismaSessionStore {
  constructor(private readonly client: PrismaClient, private readonly createAuditId: () => string = randomUUID) { super(client); }

  override async revokeByIdForUser(id: string, userId: string, at: Date, event: 'logout' | 'session_revocation' = 'session_revocation'): Promise<boolean> {
    return this.client.$transaction(async tx => {
      const result = await tx.userSession.updateMany({ where: { id, userId, revokedAt: null }, data: { revokedAt: at } });
      if (result.count !== 1) return false;
      await tx.authenticationAudit.create({ data: { id: this.createAuditId(), userId, event, occurredAt: at } });
      return true;
    }, { isolationLevel: 'Serializable' });
  }

  override async revokeAllForUser(userId: string, at: Date): Promise<number> {
    return this.client.$transaction(async tx => {
      const result = await tx.userSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: at } });
      if (result.count) await tx.authenticationAudit.create({ data: { id: this.createAuditId(), userId, event: 'logout_all', occurredAt: at } });
      return result.count;
    }, { isolationLevel: 'Serializable' });
  }
}
