import type { Employee } from '../domain/employee';
import { requirePermission, type Actor, type EmployeeRepository } from './ports';

export class ListEmployeesQuery {
  constructor(readonly actor: Actor, readonly limit = 25, readonly offset = 0) {}
}
export class ListEmployeesHandler {
  constructor(private readonly employees: EmployeeRepository) {}
  async execute(query: ListEmployeesQuery): Promise<readonly Employee[]> {
    requirePermission(query.actor, 'hrm.employee.read');
    if (!Number.isSafeInteger(query.limit) || query.limit < 1 || query.limit > 100 || !Number.isSafeInteger(query.offset) || query.offset < 0 || query.offset > 100000) throw new RangeError('Invalid pagination');
    return this.employees.list(query.actor.companyId, query.limit, query.offset);
  }
}
