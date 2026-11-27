import { BadRequestException, ConflictException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ChangeScopedEmployeeStatusCommand, ChangeScopedEmployeeStatusHandler, CreateScopedEmployeeCommand, CreateScopedEmployeeHandler, InvalidScopedEmployeeError, UpdateScopedEmployeeCommand, UpdateScopedEmployeeHandler } from '@aurum/hrm';
import type { PrismaClient } from '../generated/prisma/client';
import type { AuthenticatedSession } from '../identity/http/session.guard';
import { EmployeeWriteDeniedError, EmployeeWriteInvalidError, PrismaScopedEmployeeWriter } from './prisma-scoped-employee.writer';

function bodyObject(body: unknown): Readonly<Record<string, unknown>> {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new BadRequestException();
  return body as Record<string, unknown>;
}

export class HrmWriteService {
  private readonly writer: PrismaScopedEmployeeWriter;
  constructor(private readonly db: PrismaClient) { this.writer = new PrismaScopedEmployeeWriter(db); }
  private async map<T>(actor: AuthenticatedSession, event: string, operation: () => Promise<T>): Promise<T> {
    try { return await operation(); }
    catch (error) {
      if (error instanceof EmployeeWriteDeniedError) {
        try { await this.db.hrmSecurityAudit.create({ data: { userId: actor.userId, event } }); }
        catch { throw new InternalServerErrorException(); }
        throw new ForbiddenException();
      }
      if (error instanceof BadRequestException || error instanceof InvalidScopedEmployeeError || error instanceof EmployeeWriteInvalidError) throw new BadRequestException();
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') throw new ConflictException();
      throw new InternalServerErrorException();
    }
  }
  create(actor: AuthenticatedSession, body: unknown) { return this.map(actor, 'employee.create.denied', () => new CreateScopedEmployeeHandler(this.writer).execute(new CreateScopedEmployeeCommand(actor, bodyObject(body)))); }
  update(actor: AuthenticatedSession, id: string, body: unknown) { return this.map(actor, 'employee.update.denied', () => new UpdateScopedEmployeeHandler(this.writer).execute(new UpdateScopedEmployeeCommand(actor, id, bodyObject(body)))); }
  changeStatus(actor: AuthenticatedSession, id: string, body: unknown) {
    return this.map(actor, 'employee.status.denied', () => {
      const input = bodyObject(body);
      if (Object.keys(input).some(key => !['companyId', 'branchId', 'status'].includes(key)) || typeof input.companyId !== 'string' || typeof input.branchId !== 'string' || typeof input.status !== 'string') throw new BadRequestException();
      return new ChangeScopedEmployeeStatusHandler(this.writer).execute(new ChangeScopedEmployeeStatusCommand(actor, id, input.companyId, input.branchId, input.status));
    });
  }
}
