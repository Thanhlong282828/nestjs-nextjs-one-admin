import type { SessionService } from '../index';

export type CurrentUser = Readonly<{ id: string; email: string }>;
export type ActiveSession = Readonly<{ id: string; createdAt: Date; expiresAt: Date; current: boolean }>;
export interface IdentityQueryStore {
  findActiveUser(userId: string): Promise<CurrentUser | null>;
  /** Must filter by user, non-revoked and unexpired sessions in the database. */
  findActiveSessions(userId: string, now: Date): Promise<readonly Omit<ActiveSession, 'current'>[]>;
}

/** Tokens must come from a validated HttpOnly cookie, never logs or client-supplied user IDs. */
export class GetCurrentUserQuery { constructor(readonly sessionToken: string) {} }
export class GetCurrentUserQueryHandler {
  constructor(private readonly sessions: SessionService, private readonly identities: IdentityQueryStore) {}
  async execute(query: GetCurrentUserQuery): Promise<CurrentUser | null> {
    const actor = await this.sessions.authenticate(query.sessionToken);
    return actor ? this.identities.findActiveUser(actor.userId) : null;
  }
}

export class GetUserSessionsQuery { constructor(readonly sessionToken: string) {} }
export class GetUserSessionsQueryHandler {
  constructor(private readonly sessions: SessionService, private readonly identities: IdentityQueryStore) {}
  async execute(query: GetUserSessionsQuery): Promise<readonly ActiveSession[] | null> {
    const actor = await this.sessions.authenticate(query.sessionToken);
    if (!actor) return null;
    const sessions = await this.identities.findActiveSessions(actor.userId, new Date());
    return sessions.map(session => ({ ...session, current: session.id === actor.sessionId }));
  }
}
