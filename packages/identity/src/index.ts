export { InvalidPasswordError, hashPassword, verifyPassword } from './domain/password';

import { createHash, randomBytes, randomUUID } from 'node:crypto';

export type SessionRecord = Readonly<{
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}>;
export type SessionState = SessionRecord & Readonly<{
  revokedAt: Date | null;
  userStatus: 'active' | 'disabled';
}>;

/** Store methods must use atomic DB operations and load the current user status. */
export interface SessionStore {
  create(record: SessionRecord): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionState | null>;
  revokeByIdForUser(id: string, userId: string, at: Date, event?: 'logout' | 'session_revocation'): Promise<boolean>;
  revokeAllForUser(userId: string, at: Date): Promise<number>;
}

const sessionToken = /^[A-Za-z0-9_-]{43}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
function tokenDigest(token: string): string { return createHash('sha256').update(token, 'utf8').digest('hex'); }

/** Foundation only. The caller must authenticate the user and enforce CSRF, rate limits and cookie policy. */
export class SessionService {
  constructor(private readonly store: SessionStore) {}

  async issue(userId: string, now: Date = new Date()): Promise<{ id: string; token: string; expiresAt: Date }> {
    if (!uuid.test(userId) || !Number.isFinite(now.getTime())) throw new Error('Invalid session input');
    const token = randomBytes(32).toString('base64url');
    const id = randomUUID();
    const expiresAt = new Date(now.getTime() + sessionLifetimeMs);
    await this.store.create({ id, userId, tokenHash: tokenDigest(token), expiresAt });
    return { id, token, expiresAt };
  }

  async authenticate(token: string, now: Date = new Date()): Promise<{ sessionId: string; userId: string } | null> {
    if (typeof token !== 'string' || !sessionToken.test(token) || !Number.isFinite(now.getTime())) return null;
    const state = await this.store.findByTokenHash(tokenDigest(token));
    if (!state || state.userStatus !== 'active' || state.revokedAt !== null || !Number.isFinite(state.expiresAt.getTime()) || state.expiresAt.getTime() <= now.getTime()) return null;
    return { sessionId: state.id, userId: state.userId };
  }

  /** userId must come from the authenticated session, never from request input. */
  async revokeOwnedSession(userId: string, sessionId: string, now: Date = new Date(), event: 'logout' | 'session_revocation' = 'session_revocation'): Promise<boolean> {
    if (!uuid.test(userId) || !uuid.test(sessionId) || !Number.isFinite(now.getTime())) return false;
    return this.store.revokeByIdForUser(sessionId, userId, now, event);
  }

  async revokeAll(userId: string, now: Date = new Date()): Promise<number> {
    if (!uuid.test(userId) || !Number.isFinite(now.getTime())) throw new Error('Invalid session input');
    return this.store.revokeAllForUser(userId, now);
  }
}

export { LogoutCommand, LogoutCommandHandler, LogoutAllCommand, LogoutAllCommandHandler, RevokeSessionCommand, RevokeSessionCommandHandler } from './application/session-commands';
export { ChangePasswordCommand, ChangePasswordCommandHandler, type PasswordChangeStore } from './application/change-password';
export { GetCurrentUserQuery, GetCurrentUserQueryHandler, GetUserSessionsQuery, GetUserSessionsQueryHandler, type IdentityQueryStore, type CurrentUser, type ActiveSession } from './application/session-queries';
export { VerifyCredentials, type CredentialReader, type LoginCredential } from './application/verify-credentials';
export { LoginCommand, LoginCommandHandler, type LoginStore, type LoginResult, type LoginSession } from './application/login';
