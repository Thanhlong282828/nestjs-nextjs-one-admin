import { HttpException, Injectable, Optional, type CanActivate, type ExecutionContext } from '@nestjs/common';

type Request = { socket: { remoteAddress?: string } };
type Window = { count: number; until: number };

/** Local single-process defence only: no proxy headers are trusted. */
@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly windows = new Map<string, Window>();
  constructor(@Optional() private readonly limit = 10, @Optional() private readonly windowMs = 60_000, @Optional() private readonly maxKeys = 10_000, @Optional() private readonly now: () => number = Date.now) {
    if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1 || !Number.isSafeInteger(maxKeys) || maxKeys < 1) throw new Error('Invalid rate limit configuration');
  }

  canActivate(context: ExecutionContext): boolean {
    const ip = context.switchToHttp().getRequest<Request>().socket.remoteAddress;
    if (!ip || ip.length > 64) throw new HttpException('Too many requests', 429);
    const now = this.now();
    if (!Number.isFinite(now)) throw new HttpException('Too many requests', 429);
    let window = this.windows.get(ip);
    if (!window || window.until <= now) {
      if (!window && this.windows.size >= this.maxKeys) {
        for (const [key, value] of this.windows) if (value.until <= now) this.windows.delete(key);
        if (this.windows.size >= this.maxKeys) throw new HttpException('Too many requests', 429);
      }
      window = { count: 0, until: now + this.windowMs };
      this.windows.set(ip, window);
    }
    window.count++;
    if (window.count > this.limit) throw new HttpException('Too many requests', 429);
    return true;
  }
}
