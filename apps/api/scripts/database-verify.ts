import { createConnection } from 'mariadb';
import { Client } from 'pg';
import { parseTarget } from './database-report';

type Row = Record<string, unknown>;
type Query = (sql: string) => Promise<readonly Row[]>;
type RelationshipCheck = Readonly<{ relationship: string; status: 'verified' | 'violations' | 'empty' | 'unavailable'; violations?: string; records?: string }>;

const checks = [
  { relationship: 'company → branch', tables: ['companies', 'branches'], sql: 'SELECT COUNT(*) AS n FROM branches b LEFT JOIN companies c ON c.id = b.company_id WHERE c.id IS NULL' },
  { relationship: 'branch → department', tables: ['branches', 'hrm_departments'], sql: 'SELECT COUNT(*) AS n FROM hrm_departments d LEFT JOIN branches b ON b.id = d.branch_id AND b.company_id = d.company_id WHERE b.id IS NULL' },
  { relationship: 'department → employee', tables: ['hrm_departments', 'hrm_employees'], sql: 'SELECT COUNT(*) AS n FROM hrm_employees e LEFT JOIN hrm_departments d ON d.id = e.department_id AND d.company_id = e.company_id AND d.branch_id = e.branch_id WHERE d.id IS NULL' },
  { relationship: 'employee → attendance', tables: ['hrm_employees', 'hrm_attendance'], sql: 'SELECT COUNT(*) AS n FROM hrm_attendance a LEFT JOIN hrm_employees e ON e.id = a.employee_id AND e.company_id = a.company_id AND e.branch_id = a.branch_id WHERE e.id IS NULL' },
] as const;

export async function verifyRelationships(query: Query, engine: 'mysql' | 'postgresql', database: string) {
  const identity = await query(engine === 'mysql' ? 'SELECT DATABASE() AS db' : 'SELECT current_database() AS db');
  if (identity[0]?.db !== database) throw new Error('Connected database does not match configured target');
  const tables = await query(engine === 'mysql' ? 'SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()' : 'SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema()');
  const names = new Set(tables.flatMap(row => typeof row.name === 'string' ? [row.name] : []));
  const results: RelationshipCheck[] = [];
  for (const check of checks) {
    if (check.tables.some(name => !names.has(name))) { results.push({ relationship: check.relationship, status: 'unavailable' }); continue; }
    const countRows = await query(`SELECT COUNT(*) AS n FROM ${check.tables[1]}`);
    const total = countRows[0]?.n;
    if ((typeof total !== 'number' && typeof total !== 'bigint' && typeof total !== 'string') || !/^\d+$/.test(String(total))) throw new Error('Invalid record count');
    const rows = await query(check.sql);
    const value = rows[0]?.n;
    if ((typeof value !== 'number' && typeof value !== 'bigint' && typeof value !== 'string') || !/^\d+$/.test(String(value))) throw new Error('Invalid verification result');
    const violations = String(value);
    results.push({ relationship: check.relationship, status: BigInt(violations) !== 0n ? 'violations' : BigInt(String(total)) === 0n ? 'empty' : 'verified', violations, records: String(total) });
  }
  return { engine, database, relationships: results, note: 'Data joins checked only; database constraint definitions, permissions and complete workflows require separate verification.' };
}

/** Read-only checks; never changes schema or records. */
export async function verifyConfiguredDatabase(raw: string | undefined) {
  const target = parseTarget(raw);
  if (target.kind === 'mysql') {
    const db = await createConnection({ host: target.url.hostname, port: target.url.port ? Number(target.url.port) : 3306, user: decodeURIComponent(target.url.username), password: decodeURIComponent(target.url.password), database: target.database, connectTimeout: 5000 });
    try { return await verifyRelationships(sql => db.query<Row[]>(sql), target.kind, target.database); } finally { await db.end(); }
  }
  const db = new Client({ connectionString: target.url.toString(), connectionTimeoutMillis: 5000 });
  try { await db.connect(); return await verifyRelationships(async sql => (await db.query<Row>(sql)).rows, target.kind, target.database); } finally { await db.end(); }
}
