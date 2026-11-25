import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaAuditedSessionStore } from '../src/identity/prisma-audited-session.store.ts';
import { SessionService, LogoutCommand, LogoutCommandHandler, LogoutAllCommand, LogoutAllCommandHandler, RevokeSessionCommand, RevokeSessionCommandHandler } from '@aurum/identity';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('logout and revoke events are scoped and audit failures roll back session revocation', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const u = new URL(testUrl);
  if (u.protocol !== 'mysql:' || u.hostname !== '127.0.0.1' || !['3306','3307'].includes(u.port) || u.pathname !== '/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), otherId = randomUUID(), ids = [];
  let created = false;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`; assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    await db.identityUser.createMany({ data: [{ id: userId, email: `${userId}@example.test`, passwordHash: 'test-only' }, { id: otherId, email: `${otherId}@example.test`, passwordHash: 'test-only' }] }); created = true;
    const store = new PrismaAuditedSessionStore(db, () => { const id = randomUUID(); ids.push(id); return id; });
    const sessions = new SessionService(store);
    const current = await sessions.issue(userId), target = await sessions.issue(userId), other = await sessions.issue(otherId);
    const revoke = new RevokeSessionCommandHandler(sessions);
    assert.equal(await revoke.execute(new RevokeSessionCommand(current.token, other.id)), false);
    assert.equal(await revoke.execute(new RevokeSessionCommand(current.token, target.id)), true);
    assert.equal(await new LogoutCommandHandler(sessions).execute(new LogoutCommand(current.token)), true);
    assert.ok(await sessions.authenticate(other.token));
    const allOne = await sessions.issue(userId), allTwo = await sessions.issue(userId);
    assert.equal(await new LogoutAllCommandHandler(sessions).execute(new LogoutAllCommand(allOne.token)), true);
    assert.equal(await sessions.authenticate(allTwo.token), null);
    const events = await db.authenticationAudit.findMany({ where: { id: { in: ids } } });
    assert.deepEqual(events.map(event => event.event).sort(), ['logout', 'logout_all', 'session_revocation']);
    const collision = randomUUID(); ids.push(collision); await db.authenticationAudit.create({ data: { id: collision, event: 'test_fixture' } });
    const valid = await sessions.issue(userId), failing = new SessionService(new PrismaAuditedSessionStore(db, () => collision));
    await assert.rejects(new LogoutCommandHandler(failing).execute(new LogoutCommand(valid.token)));
    assert.ok(await sessions.authenticate(valid.token));
  } finally {
    if (ids.length) await db.authenticationAudit.deleteMany({ where: { id: { in: ids } } });
    if (created) { await db.userSession.deleteMany({ where: { userId: { in: [userId, otherId] } } }); await db.identityUser.deleteMany({ where: { id: { in: [userId, otherId] } } }); }
    await db.$disconnect();
  }
});
