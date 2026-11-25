import { createEmployee, type Employee } from '../domain/employee';
import { requirePermission, type Actor, type EmployeeRepository } from './ports';

export class CreateEmployeeCommand {
  constructor(readonly actor: Actor, readonly code: string, readonly fullName: string, readonly department: string) {}
}
export class CreateEmployeeHandler {
  constructor(private readonly employees: EmployeeRepository) {}
  async execute(command: CreateEmployeeCommand): Promise<Employee> {
    requirePermission(command.actor, 'hrm.employee.create');
    const employee = createEmployee(command.actor.companyId, command.code, command.fullName, command.department);
    await this.employees.create(employee, command.actor.userId);
    return employee;
  }
}
