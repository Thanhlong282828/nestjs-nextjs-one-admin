import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { validateTestDatabaseUrl, verifyConnectedDatabase } from './support/database-safety.mjs';
import { CreateEmployeeCommand, CreateEmployeeHandler, ForbiddenError, InvalidEmployeeError, ListEmployeesHandler, ListEmployeesQuery, PostgresEmployeeRepository } from '../dist/index.js';

const companyId = randomUUID();
const userId = randomUUID();
const actor = { userId, companyId, permissions: ['hrm.employee.create', 'hrm.employee.read'] };

test('commands validate, normalize and derive company from the actor', async () => {
  let stored;
  const repo = { async create(employee) { stored = employee; }, async list() { return []; } };
  const handler = new CreateEmployeeHandler(repo);
  const employee = await handler.execute(new CreateEmployeeCommand(actor, ' nv-001 ', ' Nguyễn An ', ' Nhân sự '));
  assert.equal(employee.companyId, companyId);
  assert.equal(employee.code, 'NV-001');
  assert.equal(employee.fullName, 'Nguyễn An');
  assert.deepEqual(stored, employee);
  await assert.rejects(() => handler.execute(new CreateEmployeeCommand(actor, '!', 'A', 'HR')), InvalidEmployeeError);
});

test('permission and pagination failures never reach repository', async () => {
  const repo = { async create() { assert.fail('unexpected create'); }, async list() { assert.fail('unexpected list'); } };
  const noPermissions = { ...actor, permissions: [] };
  await assert.rejects(() => new CreateEmployeeHandler(repo).execute(new CreateEmployeeCommand(noPermissions, 'NV-01', 'Nguyễn An', 'HR')), ForbiddenError);
  await assert.rejects(() => new ListEmployeesHandler(repo).execute(new ListEmployeesQuery(noPermissions)), ForbiddenError);
  await assert.rejects(() => new ListEmployeesHandler(repo).execute(new ListEmployeesQuery(actor, 101)), RangeError);
});

const url = process.env.HRM_TEST_DATABASE_URL;
test('PostgreSQL isolates companies and commits audit with employee', { skip: !url && 'Set HRM_TEST_DATABASE_URL to a dedicated *_test database' }, async () => {
  const pool = new pg.Pool({ connectionString: validateTestDatabaseUrl(url), max: 2 });
  const companyA = randomUUID();
  const companyB = randomUUID();
  const actorA = { ...actor, companyId: companyA };
  const actorB = { ...actor, companyId: companyB };
  let verified = false;
  try {
    await verifyConnectedDatabase(pool);
    verified = true;
    await pool.query(await readFile(new URL('../migrations/001_hrm.sql', import.meta.url), 'utf8'));
    const repo = new PostgresEmployeeRepository(pool);
    const create = new CreateEmployeeHandler(repo);
    const list = new ListEmployeesHandler(repo);
    await create.execute(new CreateEmployeeCommand(actorA, 'NV-01', 'Nguyễn An', 'Nhân sự'));
    await create.execute(new CreateEmployeeCommand(actorB, 'NV-01', 'Trần Bình', 'Công nghệ'));
    await assert.rejects(() => create.execute(new CreateEmployeeCommand(actorA, 'NV-01', 'Nhân viên trùng', 'Nhân sự')));
    await assert.rejects(() => create.execute(new CreateEmployeeCommand({ ...actorA, userId: 'invalid-uuid' }, 'NV-02', 'Rollback Test', 'Nhân sự')));
    const a = await list.execute(new ListEmployeesQuery(actorA));
    const b = await list.execute(new ListEmployeesQuery(actorB));
    assert.equal(a.length, 1);
    assert.equal(a[0].fullName, 'Nguyễn An');
    assert.equal(b.length, 1);
    assert.equal(b[0].fullName, 'Trần Bình');
    const audit = await pool.query('SELECT count(*)::int AS count FROM hrm_audit_log WHERE company_id = $1', [companyA]);
    assert.equal(audit.rows[0].count, 1);
  } finally {
    try {
      if (verified) {
        await pool.query('DELETE FROM hrm_audit_log WHERE company_id = ANY($1::uuid[])', [[companyA, companyB]]);
        await pool.query('DELETE FROM hrm_employees WHERE company_id = ANY($1::uuid[])', [[companyA, companyB]]);
      }
    } finally { await pool.end(); }
  }
});
