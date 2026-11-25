import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { CommandBus, QueryBus } = require('@nestjs/cqrs');
const { IdentityModule } = require('../dist/identity/identity.module.js');
const { LoginCommand, LogoutCommand, LogoutAllCommand, RevokeSessionCommand, ChangePasswordCommand, GetCurrentUserQuery, GetUserSessionsQuery, hashPassword } = require('@aurum/identity');

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('Nest CQRS registers identity command and query handlers against MySQL test', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const u = new URL(testUrl);
  if (u.protocol !== 'mysql:' || u.hostname !== '127.0.0.1' || !['3306', '3307'].includes(u.port) || u.pathname !== '/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), email = `${userId}@example.test`;
  let created = false, app;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`; assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    const passwordHash = await hashPassword('correct-password-123'), dummy = await hashPassword('dummy-password-456');
    await db.identityUser.create({ data: { id: userId, email, passwordHash } }); created = true;
    app = await NestFactory.createApplicationContext(IdentityModule.forClient(db, dummy), { logger: false, abortOnError: false });
    const commands = app.get(CommandBus), queries = app.get(QueryBus);
    const login = () => commands.execute(new LoginCommand(email, 'correct-password-123'));
    const one = await login(), two = await login();
    assert.deepEqual(await queries.execute(new GetCurrentUserQuery(one.token)), { id: userId, email });
    assert.equal((await queries.execute(new GetUserSessionsQuery(one.token))).length, 2);
    assert.equal(await commands.execute(new RevokeSessionCommand(one.token, two.sessionId)), true);
    assert.equal(await commands.execute(new LogoutCommand(one.token)), true);
    const three = await login(), four = await login();
    assert.equal(await commands.execute(new LogoutAllCommand(three.token)), true);
    assert.equal(await queries.execute(new GetCurrentUserQuery(four.token)), null);
    const five = await login();
    assert.equal(await commands.execute(new ChangePasswordCommand(five.token, 'correct-password-123', 'updated-password-456')), true);
    assert.equal(await queries.execute(new GetCurrentUserQuery(five.token)), null);
    const audit = await db.authenticationAudit.findMany({ where: { userId }, select: { event: true } });
    const events = new Set(audit.map(row => row.event));
    for (const expected of ['login_success','session_revocation','logout','logout_all','password_change']) assert.ok(events.has(expected), expected);
  } finally {
    await app?.close();
    if (created) { await db.authenticationAudit.deleteMany({ where: { userId } }); await db.userSession.deleteMany({ where: { userId } }); await db.identityUser.deleteMany({ where: { id: userId } }); }
    await db.$disconnect();
  }
});
