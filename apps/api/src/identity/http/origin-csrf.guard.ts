import { ForbiddenException, Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';

type Request = { headers: Record<string, string | string[] | undefined> };
export const ALLOWED_AUTH_ORIGINS = Symbol('ALLOWED_AUTH_ORIGINS');

/** Exact configured origins and a non-simple header protect state-changing browser requests. */
@Injectable()
export class OriginCsrfGuard implements CanActivate {
  constructor(@Inject(ALLOWED_AUTH_ORIGINS) private readonly allowedOrigins: readonly string[]) {
    if (!allowedOrigins.length || allowedOrigins.some(origin => {
      try { const url = new URL(origin); return !['http:', 'https:'].includes(url.protocol) || url.origin !== origin; } catch { return true; }
    })) throw new Error('Invalid origin allowlist');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.headers.origin;
    if (typeof origin !== 'string' || !this.allowedOrigins.includes(origin) || request.headers['x-aurum-request'] !== '1') throw new ForbiddenException();
    return true;
  }
}
