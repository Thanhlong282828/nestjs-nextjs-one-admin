import type { SessionService } from '../index';

/** Transport must validate origin/CSRF and avoid logging the bearer token. */
export class LogoutCommand {
  constructor(readonly sessionToken: string) {}
}

export class LogoutCommandHandler {
  constructor(private readonly sessions: SessionService) {}

  async execute(command: LogoutCommand): Promise<boolean> {
    const actor = await this.sessions.authenticate(command.sessionToken);
    if (!actor) return false;
    return this.sessions.revokeOwnedSession(actor.userId, actor.sessionId, new Date(), 'logout');
  }
}

/** The identity is derived from the session, never from a client-supplied user ID. */
export class LogoutAllCommand {
  constructor(readonly sessionToken: string) {}
}

export class LogoutAllCommandHandler {
  constructor(private readonly sessions: SessionService) {}

  async execute(command: LogoutAllCommand): Promise<boolean> {
    const actor = await this.sessions.authenticate(command.sessionToken);
    if (!actor) return false;
    await this.sessions.revokeAll(actor.userId);
    return true;
  }
}

/** Target session ID is untrusted; the owner is derived from the verified session. */
export class RevokeSessionCommand {
  constructor(readonly sessionToken: string, readonly targetSessionId: string) {}
}

export class RevokeSessionCommandHandler {
  constructor(private readonly sessions: SessionService) {}

  async execute(command: RevokeSessionCommand): Promise<boolean> {
    const actor = await this.sessions.authenticate(command.sessionToken);
    if (!actor) return false;
    return this.sessions.revokeOwnedSession(actor.userId, command.targetSessionId);
  }
}
