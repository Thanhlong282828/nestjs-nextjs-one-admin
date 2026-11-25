import type { Pool } from 'pg';
import type { EmployeeRepository } from '../application/ports';
import type { Employee } from '../domain/employee';

type EmployeeRow = { id: string; company_id: string; code: string; full_name: string; department: string; status: Employee['status']; created_at: Date };

export class PostgresEmployeeRepository implements EmployeeRepository {
  constructor(private readonly pool: Pool) {}

  async create(employee: Employee, actorId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO hrm_employees (id, company_id, code, full_name, department, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [employee.id, employee.companyId, employee.code, employee.fullName, employee.department, employee.status, employee.createdAt]);
      await client.query('INSERT INTO hrm_audit_log (company_id, actor_id, action, employee_id) VALUES ($1,$2,$3,$4)', [employee.companyId, actorId, 'employee.created', employee.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async list(companyId: string, limit: number, offset: number): Promise<readonly Employee[]> {
    const result = await this.pool.query<EmployeeRow>('SELECT id, company_id, code, full_name, department, status, created_at FROM hrm_employees WHERE company_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3', [companyId, limit, offset]);
    return result.rows.map(row => ({ id: row.id, companyId: row.company_id, code: row.code, fullName: row.full_name, department: row.department, status: row.status, createdAt: row.created_at }));
  }
}
