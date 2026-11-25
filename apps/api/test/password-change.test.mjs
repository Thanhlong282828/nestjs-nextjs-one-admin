import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaSessionStore } from '../src/identity/prisma-session.store.ts';
import { PrismaPasswordChangeStore } from '../src/identity/prisma-password-change.store.ts';
import { ChangePasswordCommand, ChangePasswordCommandHandler, SessionService, hashPassword, verifyPassword } from '@aurum/identity';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('password change persists Argon2id and atomically revokes only the owner sessions', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const url = new URL(testUrl);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) });
  const userId = randomUUID(), otherId = randomUUID();
  let fixturesCreated = false;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    const currentHash = await hashPassword('current-password-123');
    await db.identityUser.createMany({ data: [{ id: userId, email: `${userId}@example.test`, passwordHash: currentHash }, { id: otherId, email: `${otherId}@example.test`, passwordHash: currentHash }] });
    fixturesCreated = true;
    const sessions = new SessionService(new PrismaSessionStore(db));
    const current = await sessions.issue(userId), second = await sessions.issue(userId), unrelated = await sessions.issue(otherId);
    const store = new PrismaPasswordChangeStore(db);
    const handler = new ChangePasswordCommandHandler(sessions, store);
    assert.equal(await handler.execute(new ChangePasswordCommand(current.token, 'wrong', 'updated-password-456')), false);
    assert.ok(await sessions.authenticate(current.token));
    assert.equal(await handler.execute(new ChangePasswordCommand(current.token, 'current-password-123', 'updated-password-456')), true);
    const saved = await db.identityUser.findUniqueOrThrow({ where: { id: userId } });
    assert.equal(await verifyPassword(saved.passwordHash, 'updated-password-456'), true);
    assert.equal(await verifyPassword(saved.passwordHash, 'current-password-123'), false);
    assert.equal(await sessions.authenticate(current.token), null);
    assert.equal(await sessions.authenticate(second.token), null);
    assert.ok(await sessions.authenticate(unrelated.token));
    const events = await db.authenticationAudit.findMany({ where: { userId, event: 'password_change' } });
    assert.equal(events.length, 1);
    assert.equal(JSON.stringify(events).includes('updated-password-456'), false);
    assert.equal(await store.replaceAndRevoke({ userId, sessionId: current.id, previousHash: saved.passwordHash, nextHash: currentHash, at: new Date() }), false);
    assert.equal(await verifyPassword((await db.identityUser.findUniqueOrThrow({ where: { id: userId } })).passwordHash, 'updated-password-456'), true);
  } finally {
    if (fixturesCreated) {
      await db.authenticationAudit.deleteMany({ where: { userId: { in: [userId, otherId] } } });
      await db.userSession.deleteMany({ where: { userId: { in: [userId, otherId] } } });
      await db.identityUser.deleteMany({ where: { id: { in: [userId, otherId] } } });
    }
    await db.$disconnect();
  }
});
