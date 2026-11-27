import { Inject, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { SessionService } from '@aurum/identity';

/** This guard is not registered on any route until CSRF, rate limits and auth are complete. */
export const SESSION_AUTHENTICATOR = Symbol('SESSION_AUTHENTICATOR');
export type AuthenticatedSession = Readonly<{ userId: string; sessionId: string }>;
type GuardRequest = { headers: { cookie?: string | string[] }; auth?: AuthenticatedSession };
const cookieName = 'aurum_session';
const tokenFormat = /^[A-Za-z0-9_-]{43}$/;

/** Reject ambiguous cookies and avoid decoding or logging bearer secrets. */
export function readSessionCookie(header: string | string[] | undefined): string | null {
  if (typeof header !== 'string' || header.length > 4096) return null;
  const matches = header.split(';').map(part => part.trim()).filter(part => part.startsWith(`${cookieName}=`));
  if (matches.length !== 1) return null;
  const token = matches[0]?.slice(cookieName.length + 1);
  return token && tokenFormat.test(token) ? token : null;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(SESSION_AUTHENTICATOR) private readonly sessions: Pick<SessionService, 'authenticate'>) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GuardRequest>();
    delete request.auth;
    const token = readSessionCookie(request.headers.cookie);
    if (!token) throw new UnauthorizedException();
    const session = await this.sessions.authenticate(token);
    if (!session) throw new UnauthorizedException();
    request.auth = { userId: session.userId, sessionId: session.sessionId };
    return true;
  }
}
