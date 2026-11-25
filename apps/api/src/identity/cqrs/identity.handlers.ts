import { Inject } from '@nestjs/common';
import { CommandHandler, QueryHandler, type ICommandHandler, type IQueryHandler } from '@nestjs/cqrs';
import {
  LoginCommand, LoginCommandHandler as LoginUseCase,
  LogoutCommand, LogoutCommandHandler as LogoutUseCase,
  LogoutAllCommand, LogoutAllCommandHandler as LogoutAllUseCase,
  RevokeSessionCommand, RevokeSessionCommandHandler as RevokeUseCase,
  ChangePasswordCommand, ChangePasswordCommandHandler as ChangePasswordUseCase,
  GetCurrentUserQuery, GetCurrentUserQueryHandler as CurrentUserUseCase,
  GetUserSessionsQuery, GetUserSessionsQueryHandler as UserSessionsUseCase,
} from '@aurum/identity';

@CommandHandler(LoginCommand)
export class LoginBusHandler implements ICommandHandler<LoginCommand> {
  constructor(@Inject(LoginUseCase) private readonly useCase: LoginUseCase) {}
  execute(command: LoginCommand) { return this.useCase.execute(command); }
}
@CommandHandler(LogoutCommand)
export class LogoutBusHandler implements ICommandHandler<LogoutCommand> {
  constructor(@Inject(LogoutUseCase) private readonly useCase: LogoutUseCase) {}
  execute(command: LogoutCommand) { return this.useCase.execute(command); }
}
@CommandHandler(LogoutAllCommand)
export class LogoutAllBusHandler implements ICommandHandler<LogoutAllCommand> {
  constructor(@Inject(LogoutAllUseCase) private readonly useCase: LogoutAllUseCase) {}
  execute(command: LogoutAllCommand) { return this.useCase.execute(command); }
}
@CommandHandler(RevokeSessionCommand)
export class RevokeSessionBusHandler implements ICommandHandler<RevokeSessionCommand> {
  constructor(@Inject(RevokeUseCase) private readonly useCase: RevokeUseCase) {}
  execute(command: RevokeSessionCommand) { return this.useCase.execute(command); }
}
@CommandHandler(ChangePasswordCommand)
export class ChangePasswordBusHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(@Inject(ChangePasswordUseCase) private readonly useCase: ChangePasswordUseCase) {}
  execute(command: ChangePasswordCommand) { return this.useCase.execute(command); }
}
@QueryHandler(GetCurrentUserQuery)
export class CurrentUserBusHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(@Inject(CurrentUserUseCase) private readonly useCase: CurrentUserUseCase) {}
  execute(query: GetCurrentUserQuery) { return this.useCase.execute(query); }
}
@QueryHandler(GetUserSessionsQuery)
export class UserSessionsBusHandler implements IQueryHandler<GetUserSessionsQuery> {
  constructor(@Inject(UserSessionsUseCase) private readonly useCase: UserSessionsUseCase) {}
  execute(query: GetUserSessionsQuery) { return this.useCase.execute(query); }
}
