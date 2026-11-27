import { Module, type DynamicModule } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { PrismaClient } from '../../generated/prisma/client';
import { IdentityModule } from '../identity.module';
import { AUTH_COOKIE_SECURE, AuthController } from './auth.controller';
import { AuthHttpService } from './auth-http.service';
import { ALLOWED_AUTH_ORIGINS, OriginCsrfGuard } from './origin-csrf.guard';
import { LoginRateLimitGuard } from './login-rate-limit.guard';
import { SessionGuard } from './session.guard';

/** Explicit composition for isolated testing; not registered in AppModule yet. */
@Module({})
export class AuthHttpModule {
  static forClient(db: PrismaClient, dummyHash: string, origins: readonly string[], secureCookie: boolean, createLoginAuditId?: () => string): DynamicModule {
    if (process.env.NODE_ENV === 'production') throw new Error('Authentication HTTP is unavailable in production until a shared rate limiter is configured');
    return {
      module: AuthHttpModule,
      imports: [IdentityModule.forClient(db, dummyHash, createLoginAuditId)],
      controllers: [AuthController],
      providers: [
        { provide: ALLOWED_AUTH_ORIGINS, useValue: origins },
        { provide: AUTH_COOKIE_SECURE, useValue: secureCookie },
        { provide: AuthHttpService, useFactory: (commands: CommandBus, queries: QueryBus) => new AuthHttpService(commands, queries), inject: [CommandBus, QueryBus] },
        OriginCsrfGuard, LoginRateLimitGuard, SessionGuard,
      ],
      exports: [IdentityModule, OriginCsrfGuard, ALLOWED_AUTH_ORIGINS],
    };
  }
}
