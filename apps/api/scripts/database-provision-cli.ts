import { createConnection } from 'mariadb';
import { Client } from 'pg';
import { parseTarget } from './database-report';
import { checkRuntime } from './runtime-permission-check';
import { DEMO_082, provisionConnectedDemo } from './connected-demo-provisioner';
import { inspectDemoPlan } from './demo-plan-inspection';

/** Never substitute an isolated test database for the configured runtime target. */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--dry-run' && arg !== '--execute') || (args.includes('--dry-run') && args.includes('--execute'))) throw new Error('Use --dry-run or --execute');
  const execute = args.includes('--execute');
  const target = parseTarget(process.env.DATABASE_URL);
  const environment = process.env.NODE_ENV;
  if (environment !== 'development' && environment !== 'test') throw new Error('Explicit development or test NODE_ENV is required');
  if (environment === 'development' && /(?:^|[_-])test(?:$|[_-])/i.test(target.database)) throw new Error('Development cannot target a test database');
  if (environment === 'test' && !/(?:^|[_-])test(?:$|[_-])/i.test(target.database)) throw new Error('Test environment requires a test database');
  console.log(JSON.stringify({ mode: execute ? 'execute' : 'dry-run', environment, provider: target.kind, host: target.url.hostname, port: target.url.port || (target.kind === 'mysql' ? '3306' : '5432'), database: target.database, principal: decodeURIComponent(target.url.username) }));
  if (target.kind === 'postgresql') {
    if (execute) throw new Error('PostgreSQL provisioning is not implemented or verified');
    const client = new Client({ connectionString: target.url.toString(), connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      const result = await client.query<{ db: string; principal: string }>('SELECT current_database() AS db, current_user AS principal');
      if (result.rows[0]?.db !== target.database) throw new Error('Connected database identity mismatch');
      console.log(JSON.stringify({ identity: result.rows[0], manifest: { classification: 'DEMO', companyId: DEMO_082.companyId, branches: 3, departments: 9, employees: 30, attendance: 300 }, note: 'Read-only preview; PostgreSQL write support is unavailable.' }));
    } finally { await client.end(); }
    return;
  }
  const db = await createConnection({ host: target.url.hostname, port: Number(target.url.port || '3306'), user: decodeURIComponent(target.url.username), password: decodeURIComponent(target.url.password), database: target.database, connectTimeout: 5000 });
  try {
    const identity = await db.query<Array<{ db: string; principal: string }>>('SELECT DATABASE() AS db, CURRENT_USER() AS principal');
    if (identity[0]?.db !== target.database) throw new Error('Connected database identity mismatch');
    const inspection = await inspectDemoPlan((sql, params) => db.query<Array<Record<string, unknown>>>(sql, params ? [...params] : []));
    console.log(JSON.stringify({ identity: identity[0], manifest: { classification: 'DEMO', companyId: DEMO_082.companyId, branches: 3, departments: 9, employees: 30, attendance: 300 }, inspection }));
    if (execute && inspection.status === 'conflict') throw new Error('DEMO company ownership conflict');
    if (execute && inspection.status === 'unavailable') throw new Error('DEMO ownership inspection is unavailable');
  } finally { await db.end(); }
  if (!execute) return;
  if (environment === 'development') {
    const permissions = await checkRuntime(process.env.DATABASE_URL);
    if (!permissions.ready) throw new Error('Runtime permission readiness failed; DBA action is required');
    // This deliberately remains disabled until the development backup/restore,
    // restricted runtime HTTP and provisioning safety gates are independently tested.
    throw new Error('Development executor is not yet enabled; safety verification is incomplete');
  }
  const migration = parseTarget(process.env.MIGRATION_DATABASE_URL);
  if (migration.kind !== target.kind || migration.url.hostname !== target.url.hostname || (migration.url.port || '3306') !== (target.url.port || '3306') || migration.database !== target.database || migration.url.username === target.url.username) throw new Error('Migration target or principal mismatch');
  const password = process.env.AURUM_DEMO_PASSWORD;
  if (!password) throw new Error('AURUM_DEMO_PASSWORD is required and is never logged');
  console.log(JSON.stringify({ result: await provisionConnectedDemo(migration.url.toString(), password) }));
}

main().catch(error => { console.error(`Provisioning stopped: ${error instanceof Error ? error.message : 'unknown error'}`); process.exitCode = 1; });
