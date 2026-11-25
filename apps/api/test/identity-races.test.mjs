import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaAuditedSessionStore } from '../src/identity/prisma-audited-session.store.ts';
import { PrismaCredentialReader } from '../src/identity/prisma-credential.reader.ts';
import { PrismaLoginStore } from '../src/identity/prisma-login.store.ts';
import { PrismaPasswordChangeStore } from '../src/identity/prisma-password-change.store.ts';
import { SessionService, VerifyCredentials, LoginCommand, LoginCommandHandler, LogoutCommand, LogoutCommandHandler, LogoutAllCommand, LogoutAllCommandHandler, ChangePasswordCommand, ChangePasswordCommandHandler, hashPassword, verifyPassword } from '@aurum/identity';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
function assertOnlySerializationFailures(results) {
  for (const result of results) {
    if (result.status === 'rejected') {
      assert.ok(result.reason?.code === 'P2034' || /deadlock|serialization|write conflict/i.test(String(result.reason?.message)), 'Unexpected concurrent operation failure');
    }
  }
}
test('MySQL concurrent session operations preserve security and audit transaction rollback', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const url = new URL(testUrl);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306','3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), email = `${userId}@example.test`;
  let created = false;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`; assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    const oldHash = await hashPassword('current-password-123'), dummy = await hashPassword('dummy-password-456');
    await db.identityUser.create({ data: { id: userId, email, passwordHash: oldHash } }); created = true;
    const sessions = new SessionService(new PrismaAuditedSessionStore(db));
    const original = await sessions.issue(userId);
    assert.ok(await sessions.authenticate(original.token, new Date(original.expiresAt.getTime() - 1)));
    assert.equal(await sessions.authenticate(original.token, original.expiresAt), null);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'disabled' } });
    assert.equal(await sessions.authenticate(original.token), null);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'active' } });
    const collision = randomUUID(); await db.authenticationAudit.create({ data: { id: collision, userId, event: 'test_fixture' } });
    const failing = new ChangePasswordCommandHandler(sessions, new PrismaPasswordChangeStore(db, () => collision));
    await assert.rejects(failing.execute(new ChangePasswordCommand(original.token, 'current-password-123', 'replacement-password-123')));
    assert.equal((await db.identityUser.findUniqueOrThrow({ where: { id: userId } })).passwordHash, oldHash);
    assert.ok(await sessions.authenticate(original.token));
    const change = new ChangePasswordCommandHandler(sessions, new PrismaPasswordChangeStore(db));
    const changes = await Promise.allSettled([
      change.execute(new ChangePasswordCommand(original.token, 'current-password-123', 'replacement-password-123')),
      change.execute(new ChangePasswordCommand(original.token, 'current-password-123', 'replacement-password-456')),
    ]);
    assertOnlySerializationFailures(changes);
    assert.equal(changes.filter(item => item.status === 'fulfilled' && item.value === true).length, 1);
    const savedHash = (await db.identityUser.findUniqueOrThrow({ where: { id: userId } })).passwordHash;
    assert.equal(Number(await verifyPassword(savedHash, 'replacement-password-123')) + Number(await verifyPassword(savedHash, 'replacement-password-456')), 1);
    assert.equal(await sessions.authenticate(original.token), null);
    assert.equal(await db.authenticationAudit.count({ where: { userId, event: 'password_change' } }), 1);
    const single = await sessions.issue(userId), logout = new LogoutCommandHandler(sessions);
    const logouts = await Promise.allSettled([logout.execute(new LogoutCommand(single.token)), logout.execute(new LogoutCommand(single.token))]);
    assertOnlySerializationFailures(logouts);
    assert.equal(logouts.filter(item => item.status === 'fulfilled' && item.value === true).length, 1);
    assert.equal(await sessions.authenticate(single.token), null);
    assert.equal(await db.authenticationAudit.count({ where: { userId, event: 'logout' } }), 1);
    const first = await sessions.issue(userId), second = await sessions.issue(userId), logoutAll = new LogoutAllCommandHandler(sessions);
    const all = await Promise.allSettled([logoutAll.execute(new LogoutAllCommand(first.token)), logoutAll.execute(new LogoutAllCommand(second.token))]);
    assertOnlySerializationFailures(all);
    assert.ok(all.some(item => item.status === 'fulfilled' && item.value === true));
    assert.equal(await sessions.authenticate(first.token), null); assert.equal(await sessions.authenticate(second.token), null);
    assert.equal(await db.authenticationAudit.count({ where: { userId, event: 'logout_all' } }), 1);
    const currentPassword = await verifyPassword(savedHash, 'replacement-password-123') ? 'replacement-password-123' : 'replacement-password-456';
    const old = await sessions.issue(userId), login = new LoginCommandHandler(new VerifyCredentials(new PrismaCredentialReader(db), dummy), new PrismaLoginStore(db));
    const rotated = await Promise.allSettled([login.execute(new LoginCommand(email, currentPassword, old.token)), login.execute(new LoginCommand(email, currentPassword, old.token))]);
    assertOnlySerializationFailures(rotated);
    const successful = rotated.filter(item => item.status === 'fulfilled' && item.value !== null);
    assert.ok(successful.length >= 1); assert.equal(await sessions.authenticate(old.token), null);
    for (const item of successful) assert.ok(await sessions.authenticate(item.value.token));
    assert.equal(await db.authenticationAudit.count({ where: { userId, event: 'session_rotation' } }), 1);
  } finally {
    if (created) { await db.authenticationAudit.deleteMany({ where: { userId } }); await db.userSession.deleteMany({ where: { userId } }); await db.identityUser.deleteMany({ where: { id: userId } }); }
    await db.$disconnect();
  }
});
