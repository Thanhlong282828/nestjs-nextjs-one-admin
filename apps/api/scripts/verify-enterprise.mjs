import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const url = new URL(process.env.ENTERPRISE_TEST_DATABASE_URL ?? '');
if (url.hostname !== '127.0.0.1' || url.port !== '5433' || url.pathname !== '/enterprise_test' || url.username !== 'enterprise_app' || url.search || url.hash) throw Error('Refusing non-test or non-local database');
const connect = () => new PrismaClient({ adapter: new PrismaPg({ connectionString: url.toString(), connectionTimeoutMillis: 2000 }) });
const id = randomUUID();
let client = connect();
let created = false;
try {
  const actual = await client.$queryRaw`SELECT current_database() AS database, current_user AS username`;
  assert.equal(actual[0]?.database, 'enterprise_test');
  assert.equal(actual[0]?.username, 'enterprise_app');
  const role = await client.$queryRaw`SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user`;
  assert.deepEqual([role[0]?.rolsuper, role[0]?.rolcreatedb, role[0]?.rolcreaterole], [false, false, false]);
  const grants = await client.$queryRaw`SELECT has_table_privilege(current_user, '_prisma_migrations', 'SELECT,INSERT,UPDATE,DELETE') AS allowed`;
  assert.equal(grants[0]?.allowed, false, 'Application role must not access migration history');
  const company = await client.company.create({ data: { id, name: 'Isolated verification' } });
  created = true;
  assert.equal(company.id, id);
  assert.equal((await client.company.findUnique({ where: { id } }))?.name, 'Isolated verification');
  await client.company.update({ where: { id }, data: { name: 'Updated verification' } });
  await client.$disconnect();
  const restart = spawnSync('docker', ['compose', 'restart', 'postgres_enterprise'], { cwd: '../..', stdio: 'inherit' });
  if (restart.status !== 0) throw Error('Could not restart enterprise test service');
  client = connect();
  let found;
  for (let i = 0; i < 30; i++) {
    try { found = await client.company.findUnique({ where: { id } }); break; }
    catch { await delay(500); }
  }
  assert.equal(found?.name, 'Updated verification', 'Updated test record must survive container restart');
  await client.company.delete({ where: { id } });
  created = false;
  assert.equal(await client.company.findUnique({ where: { id } }), null);
  console.log('PASS: Prisma create/read/update/delete, least-privilege role, and persistence after restart on enterprise_test.');
} finally {
  if (created) {
    try { await client.company.deleteMany({ where: { id } }); }
    catch { console.error('Test record cleanup failed; check enterprise_test manually:', id); }
  }
  await client.$disconnect();
}
