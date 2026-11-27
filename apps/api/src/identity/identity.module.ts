import { Module, type DynamicModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionService, VerifyCredentials, LoginCommandHandler, LogoutCommandHandler, LogoutAllCommandHandler, RevokeSessionCommandHandler, ChangePasswordCommandHandler, GetCurrentUserQueryHandler, GetUserSessionsQueryHandler } from '@aurum/identity';
import type { PrismaClient } from '../generated/prisma/client';
import { PrismaAuditedSessionStore } from './prisma-audited-session.store';
import { PrismaCredentialReader } from './prisma-credential.reader';
import { PrismaIdentityQueryStore } from './prisma-identity-query.store';
import { PrismaLoginStore } from './prisma-login.store';
import { PrismaPasswordChangeStore } from './prisma-password-change.store';
import { LoginBusHandler, LogoutBusHandler, LogoutAllBusHandler, RevokeSessionBusHandler, ChangePasswordBusHandler, CurrentUserBusHandler, UserSessionsBusHandler } from './cqrs/identity.handlers';
import { SESSION_AUTHENTICATOR } from './http/session.guard';

/** Internal composition only: never import into an HTTP app until security controls are complete. */
@Module({})
export class IdentityModule {
  static forClient(client: PrismaClient, dummyHash: string, createLoginAuditId?: () => string): DynamicModule {
    const sessions = new SessionService(new PrismaAuditedSessionStore(client));
    const verifier = new VerifyCredentials(new PrismaCredentialReader(client), dummyHash);
    const queries = new PrismaIdentityQueryStore(client);
    return {
      module: IdentityModule,
      imports: [CqrsModule.forRoot()],
      providers: [
        { provide: LoginCommandHandler, useValue: new LoginCommandHandler(verifier, new PrismaLoginStore(client, createLoginAuditId)) },
        { provide: SESSION_AUTHENTICATOR, useValue: sessions },
        { provide: LogoutCommandHandler, useValue: new LogoutCommandHandler(sessions) },
        { provide: LogoutAllCommandHandler, useValue: new LogoutAllCommandHandler(sessions) },
        { provide: RevokeSessionCommandHandler, useValue: new RevokeSessionCommandHandler(sessions) },
        { provide: ChangePasswordCommandHandler, useValue: new ChangePasswordCommandHandler(sessions, new PrismaPasswordChangeStore(client)) },
        { provide: GetCurrentUserQueryHandler, useValue: new GetCurrentUserQueryHandler(sessions, queries) },
        { provide: GetUserSessionsQueryHandler, useValue: new GetUserSessionsQueryHandler(sessions, queries) },
        LoginBusHandler, LogoutBusHandler, LogoutAllBusHandler, RevokeSessionBusHandler, ChangePasswordBusHandler, CurrentUserBusHandler, UserSessionsBusHandler,
      ],
      exports: [CqrsModule, SESSION_AUTHENTICATOR],
    };
  }
}
