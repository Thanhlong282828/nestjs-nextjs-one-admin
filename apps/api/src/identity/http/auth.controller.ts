import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthHttpService } from './auth-http.service';
import { OriginCsrfGuard } from './origin-csrf.guard';
import { LoginRateLimitGuard } from './login-rate-limit.guard';
import { SessionGuard } from './session.guard';

type Request = { headers: { cookie?: string | string[] } };
type Response = { cookie(name: string, value: string, options: object): void; clearCookie(name: string, options: object): void; setHeader(name: string, value: string): void };
export const AUTH_COOKIE_SECURE = Symbol('AUTH_COOKIE_SECURE');

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(AuthHttpService) private readonly auth: AuthHttpService, @Inject(AUTH_COOKIE_SECURE) private readonly secure: boolean) {}

  @Post('login') @HttpCode(200) @UseGuards(OriginCsrfGuard, LoginRateLimitGuard)
  async login(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<{ authenticated: true }> {
    const session = await this.auth.login(body, request.headers.cookie);
    response.setHeader('Cache-Control', 'no-store');
    response.cookie('aurum_session', session.value, { httpOnly: true, secure: this.secure, sameSite: 'strict', path: '/', expires: session.expiresAt });
    return { authenticated: true };
  }

  @Get('me') @UseGuards(SessionGuard)
  async me(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<Readonly<{ id: string; email: string }>> {
    response.setHeader('Cache-Control', 'no-store');
    return this.auth.currentUser(request.headers.cookie);
  }

  @Post('logout') @HttpCode(204) @UseGuards(OriginCsrfGuard, SessionGuard)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.auth.logout(request.headers.cookie);
    response.setHeader('Cache-Control', 'no-store');
    response.clearCookie('aurum_session', { httpOnly: true, secure: this.secure, sameSite: 'strict', path: '/' });
  }
}
