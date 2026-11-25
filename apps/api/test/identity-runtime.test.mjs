import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { Module } = require('@nestjs/common');
const { CommandBus, QueryBus } = require('@nestjs/cqrs');
const { IdentityModule } = require('../dist/identity/identity.module.js');
const { HealthModule } = require('../dist/health/health.module.js');
const { LoginCommand, LogoutCommand, GetCurrentUserQuery, hashPassword } = require('@aurum/identity');
const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;

test('Nest HTTP app boots identity CQRS without exposing auth routes and shuts down cleanly', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const u = new URL(testUrl);
  if (u.protocol !== 'mysql:' || u.hostname !== '127.0.0.1' || !['3306','3307'].includes(u.port) || u.pathname !== '/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), email = `${userId}@example.test`, previousUrl = process.env.DATABASE_URL;
  let created = false, app;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`; assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    const passwordHash = await hashPassword('correct-password-123'), dummy = await hashPassword('dummy-password-456');
    await db.identityUser.create({ data: { id: userId, email, passwordHash } }); created = true;
    process.env.DATABASE_URL = testUrl;
    class TestApp {}
    Module({ imports: [HealthModule, IdentityModule.forClient(db, dummy)] })(TestApp);
    app = await NestFactory.create(TestApp, { logger: false, abortOnError: false });
    app.enableShutdownHooks();
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    assert.equal((await fetch(`${base}/health/ready`)).status, 200);
    assert.equal((await fetch(`${base}/auth/login`, { method: 'POST' })).status, 404);
    const commands = app.get(CommandBus), queries = app.get(QueryBus);
    const session = await commands.execute(new LoginCommand(email, 'correct-password-123'));
    assert.deepEqual(await queries.execute(new GetCurrentUserQuery(session.token)), { id: userId, email });
    assert.equal(await commands.execute(new LogoutCommand(session.token)), true);
    assert.equal(await queries.execute(new GetCurrentUserQuery(session.token)), null);
    await app.close(); app = undefined;
    await assert.rejects(fetch(`${base}/health`));
  } finally {
    await app?.close();
    if (previousUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousUrl;
    if (created) { await db.authenticationAudit.deleteMany({ where: { userId } }); await db.userSession.deleteMany({ where: { userId } }); await db.identityUser.deleteMany({ where: { id: userId } }); }
    await db.$disconnect();
  }
});
