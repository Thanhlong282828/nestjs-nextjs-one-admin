import { randomUUID } from 'node:crypto';

export type Employee = Readonly<{
  id: string;
  companyId: string;
  code: string;
  fullName: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}>;

export class InvalidEmployeeError extends Error {}

export function createEmployee(companyId: string, code: string, fullName: string, department: string): Employee {
  const cleanCode = code.trim().toUpperCase();
  const cleanName = fullName.trim();
  const cleanDepartment = department.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(companyId)) throw new InvalidEmployeeError('Invalid company');
  if (!/^[A-Z0-9-]{2,32}$/.test(cleanCode)) throw new InvalidEmployeeError('Employee code must contain 2–32 letters, numbers or hyphens');
  if (cleanName.length < 2 || cleanName.length > 120) throw new InvalidEmployeeError('Name must contain 2–120 characters');
  if (cleanDepartment.length < 2 || cleanDepartment.length > 100) throw new InvalidEmployeeError('Department must contain 2–100 characters');
  return { id: randomUUID(), companyId, code: cleanCode, fullName: cleanName, department: cleanDepartment, status: 'active', createdAt: new Date() };
}
