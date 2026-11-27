import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginCommand, LogoutCommand, GetCurrentUserQuery, type LoginResult } from '@aurum/identity';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { readSessionCookie } from './session.guard';

type HeaderValue = string | string[] | undefined;
export type AuthCookie = Readonly<{ value: string; expiresAt: Date }>;

/** Application bridge; controllers must enforce origin, CSRF and rate limits before invoking. */
export class AuthHttpService {
  constructor(private readonly commands: Pick<CommandBus, 'execute'>, private readonly queries: Pick<QueryBus, 'execute'>) {}

  async login(body: unknown, cookie: HeaderValue): Promise<AuthCookie> {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new BadRequestException();
    const value = body as Record<string, unknown>;
    if (Object.keys(value).some(key => key !== 'email' && key !== 'password') || typeof value.email !== 'string' || typeof value.password !== 'string' || Buffer.byteLength(value.email) > 254 || Buffer.byteLength(value.password) > 1024) throw new BadRequestException();
    const result: LoginResult | null = await this.commands.execute(new LoginCommand(value.email, value.password, readSessionCookie(cookie)));
    if (!result) throw new UnauthorizedException();
    return { value: result.token, expiresAt: result.expiresAt };
  }

  async currentUser(cookie: HeaderValue): Promise<Readonly<{ id: string; email: string }>> {
    const token = readSessionCookie(cookie);
    if (!token) throw new UnauthorizedException();
    const user: Readonly<{ id: string; email: string }> | null = await this.queries.execute(new GetCurrentUserQuery(token));
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async logout(cookie: HeaderValue): Promise<void> {
    const token = readSessionCookie(cookie);
    if (!token || !await this.commands.execute(new LogoutCommand(token))) throw new UnauthorizedException();
  }
}
