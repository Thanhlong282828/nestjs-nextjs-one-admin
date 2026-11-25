import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { VerifyCredentials } from './verify-credentials';

export type LoginSession = Readonly<{ id: string; userId: string; tokenHash: string; expiresAt: Date }>;
export interface LoginStore {
  /** Atomically verify unchanged password hash and active status, create session and audit success. */
  createSessionIfUnchanged(input: Readonly<{ session: LoginSession; expectedPasswordHash: string; at: Date; previousTokenHash: string | null }>): Promise<boolean>;
  /** Failure audit deliberately contains no email, credential, token, or hash. */
  recordFailure(at: Date): Promise<void>;
}
export class LoginCommand { constructor(readonly email: string, readonly password: string, readonly previousSessionToken: string | null = null) {} }
export type LoginResult = Readonly<{ sessionId: string; token: string; expiresAt: Date }>;

/** Not HTTP-ready: caller must enforce atomic rate limits, CSRF, secure cookies and uniform errors. */
export class LoginCommandHandler {
  constructor(private readonly verifier: VerifyCredentials, private readonly store: LoginStore) {}

  async execute(command: LoginCommand): Promise<LoginResult | null> {
    const verified = await this.verifier.verifyForLogin(command.email, command.password);
    const now = new Date();
    if (!verified) { await this.store.recordFailure(now); return null; }
    const token = randomBytes(32).toString('base64url');
    const session = { id: randomUUID(), userId: verified.userId, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000) };
    const previousTokenHash = typeof command.previousSessionToken === 'string' && /^[A-Za-z0-9_-]{43}$/.test(command.previousSessionToken) ? createHash('sha256').update(command.previousSessionToken).digest('hex') : null;
    if (!await this.store.createSessionIfUnchanged({ session, expectedPasswordHash: verified.passwordHash, at: now, previousTokenHash })) {
      await this.store.recordFailure(now);
      return null;
    }
    return { sessionId: session.id, token, expiresAt: session.expiresAt };
  }
}
