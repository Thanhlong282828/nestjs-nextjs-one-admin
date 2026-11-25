import { hashPassword, verifyPassword } from '../domain/password';
import type { SessionService } from '../index';

export interface PasswordChangeStore {
  findActivePasswordHash(userId: string): Promise<string | null>;
  /** Must atomically check current hash and session, replace hash and revoke all user sessions. */
  replaceAndRevoke(input: Readonly<{ userId: string; sessionId: string; previousHash: string; nextHash: string; at: Date }>): Promise<boolean>;
}

/** Transport must enforce CSRF/origin and rate limits; secrets must never be logged. */
export class ChangePasswordCommand {
  constructor(readonly sessionToken: string, readonly currentPassword: string, readonly newPassword: string) {}
}

export class ChangePasswordCommandHandler {
  constructor(private readonly sessions: SessionService, private readonly passwords: PasswordChangeStore) {}

  async execute(command: ChangePasswordCommand): Promise<boolean> {
    const actor = await this.sessions.authenticate(command.sessionToken);
    if (!actor) return false;
    const previousHash = await this.passwords.findActivePasswordHash(actor.userId);
    if (!previousHash || !(await verifyPassword(previousHash, command.currentPassword))) return false;
    const nextHash = await hashPassword(command.newPassword);
    return this.passwords.replaceAndRevoke({ userId: actor.userId, sessionId: actor.sessionId, previousHash, nextHash, at: new Date() });
  }
}
