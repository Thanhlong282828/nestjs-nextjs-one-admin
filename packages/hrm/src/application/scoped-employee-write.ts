import { InvalidScopedEmployeeError, PrepareScopedEmployeeCommand, PrepareScopedEmployeeHandler, type PreparedEmployee } from './prepare-scoped-employee';

export type EmployeeActor = Readonly<{ userId: string; sessionId: string }>;
export type ScopedEmployeeRecord = PreparedEmployee & Readonly<{ id: string; status: string }>;
export interface ScopedEmployeeWriter {
  create(actor: EmployeeActor, employee: PreparedEmployee): Promise<ScopedEmployeeRecord>;
  update(actor: EmployeeActor, employeeId: string, employee: PreparedEmployee): Promise<ScopedEmployeeRecord>;
  changeStatus(actor: EmployeeActor, employeeId: string, companyId: string, branchId: string, status: 'active' | 'inactive'): Promise<ScopedEmployeeRecord>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function requireId(id: string): void { if (!uuid.test(id)) throw new InvalidScopedEmployeeError('Invalid identifier'); }

export class CreateScopedEmployeeCommand {
  constructor(readonly actor: EmployeeActor, readonly input: Readonly<Record<string, unknown>>) {}
}
export class CreateScopedEmployeeHandler {
  constructor(private readonly writer: ScopedEmployeeWriter) {}
  execute(command: CreateScopedEmployeeCommand): Promise<ScopedEmployeeRecord> {
    return this.writer.create(command.actor, new PrepareScopedEmployeeHandler().execute(new PrepareScopedEmployeeCommand(command.input)));
  }
}
export class UpdateScopedEmployeeCommand {
  constructor(readonly actor: EmployeeActor, readonly employeeId: string, readonly input: Readonly<Record<string, unknown>>) {}
}
export class UpdateScopedEmployeeHandler {
  constructor(private readonly writer: ScopedEmployeeWriter) {}
  execute(command: UpdateScopedEmployeeCommand): Promise<ScopedEmployeeRecord> {
    requireId(command.employeeId);
    return this.writer.update(command.actor, command.employeeId, new PrepareScopedEmployeeHandler().execute(new PrepareScopedEmployeeCommand(command.input)));
  }
}
export class ChangeScopedEmployeeStatusCommand {
  constructor(readonly actor: EmployeeActor, readonly employeeId: string, readonly companyId: string, readonly branchId: string, readonly status: string) {}
}
export class ChangeScopedEmployeeStatusHandler {
  constructor(private readonly writer: ScopedEmployeeWriter) {}
  execute(command: ChangeScopedEmployeeStatusCommand): Promise<ScopedEmployeeRecord> {
    requireId(command.employeeId); requireId(command.companyId); requireId(command.branchId);
    if (command.status !== 'active' && command.status !== 'inactive') throw new InvalidScopedEmployeeError('Unsupported status');
    return this.writer.changeStatus(command.actor, command.employeeId, command.companyId, command.branchId, command.status);
  }
}
