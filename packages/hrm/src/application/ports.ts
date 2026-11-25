import type { Employee } from '../domain/employee';

export type Actor = Readonly<{ userId: string; companyId: string; permissions: readonly string[] }>;
export interface EmployeeRepository {
  create(employee: Employee, actorId: string): Promise<void>;
  list(companyId: string, limit: number, offset: number): Promise<readonly Employee[]>;
}
export class ForbiddenError extends Error {}
export function requirePermission(actor: Actor, permission: string): void {
  if (!actor.permissions.includes(permission)) throw new ForbiddenError('Insufficient permission');
}
