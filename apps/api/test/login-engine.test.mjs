import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaCredentialReader } from '../src/identity/prisma-credential.reader.ts';
import { PrismaLoginStore } from '../src/identity/prisma-login.store.ts';
import { PrismaSessionStore } from '../src/identity/prisma-session.store.ts';
import { VerifyCredentials, LoginCommand, LoginCommandHandler, SessionService, hashPassword } from '@aurum/identity';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('login writes only token hash and safe audit, rejects failures and supports concurrent sessions', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const u = new URL(testUrl);
  if (u.protocol !== 'mysql:' || u.hostname !== '127.0.0.1' || !['3306','3307'].includes(u.port) || u.pathname !== '/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), otherId = randomUUID(), email = `${userId}@example.test`, auditIds = [];
  let created = false;
  try {
    const actual = await db.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    const passwordHash = await hashPassword('correct-password-123'), dummy = await hashPassword('dummy-password-456');
    await db.identityUser.create({ data: { id: userId, email, passwordHash } }); created = true;
    await db.identityUser.create({ data: { id: otherId, email: `${otherId}@example.test`, passwordHash } });
    const store = new PrismaLoginStore(db, () => { const id = randomUUID(); auditIds.push(id); return id; });
    const handler = new LoginCommandHandler(new VerifyCredentials(new PrismaCredentialReader(db), dummy), store);
    assert.equal(await handler.execute(new LoginCommand(email, 'wrong-password')), null);
    assert.equal(await handler.execute(new LoginCommand(`${randomUUID()}@example.test`, 'correct-password-123')), null);
    for (const status of ['disabled', 'locked']) {
      await db.identityUser.update({ where: { id: userId }, data: { status } });
      assert.equal(await handler.execute(new LoginCommand(email, 'correct-password-123')), null);
    }
    await db.identityUser.update({ where: { id: userId }, data: { status: 'active' } });
    const results = await Promise.all([handler.execute(new LoginCommand(email, 'correct-password-123')), handler.execute(new LoginCommand(email, 'correct-password-123'))]);
    assert.ok(results.every(Boolean)); assert.notEqual(results[0].token, results[1].token);
    for (const result of results) {
      const row = await db.userSession.findUniqueOrThrow({ where: { id: result.sessionId } });
      assert.equal(row.tokenHash, createHash('sha256').update(result.token).digest('hex'));
      assert.notEqual(row.tokenHash, result.token);
      assert.deepEqual(Object.keys(result).sort(), ['expiresAt', 'sessionId', 'token']);
      assert.equal((await new SessionService(new PrismaSessionStore(db)).authenticate(result.token)).userId, userId);
    }
    const audit = await db.authenticationAudit.findMany({ where: { id: { in: auditIds } } });
    assert.equal(audit.filter(row => row.event === 'login_success').length, 2);
    assert.equal(audit.filter(row => row.event === 'login_failure').length, 4);
    assert.ok(audit.every(row => !JSON.stringify(row).includes('password') && !JSON.stringify(row).includes(results[0].token)));
    const rotated = await handler.execute(new LoginCommand(email, 'correct-password-123', results[0].token));
    assert.ok(rotated); assert.notEqual(rotated.token, results[0].token);
    assert.equal(await new SessionService(new PrismaSessionStore(db)).authenticate(results[0].token), null);
    assert.ok(await new SessionService(new PrismaSessionStore(db)).authenticate(results[1].token));
    const unrelated = await new SessionService(new PrismaSessionStore(db)).issue(otherId);
    assert.ok(await handler.execute(new LoginCommand(email, 'correct-password-123', unrelated.token)));
    assert.ok(await new SessionService(new PrismaSessionStore(db)).authenticate(unrelated.token));
    const collisionId = randomUUID(); auditIds.push(collisionId);
    await db.authenticationAudit.create({ data: { id: collisionId, event: 'test_fixture' } });
    const failing = new LoginCommandHandler(new VerifyCredentials(new PrismaCredentialReader(db), dummy), new PrismaLoginStore(db, () => collisionId));
    const countBeforeFailure = await db.userSession.count({ where: { userId } });
    await assert.rejects(failing.execute(new LoginCommand(email, 'correct-password-123', results[1].token)));
    assert.equal(await db.userSession.count({ where: { userId } }), countBeforeFailure);
    assert.ok(await new SessionService(new PrismaSessionStore(db)).authenticate(results[1].token));
    assert.equal(await store.createSessionIfUnchanged({ session: { id: randomUUID(), userId, tokenHash: 'a'.repeat(64), expiresAt: new Date(Date.now()+60000) }, expectedPasswordHash: 'stale-hash', at: new Date(), previousTokenHash: null }), false);
  } finally {
    if (auditIds.length) await db.authenticationAudit.deleteMany({ where: { id: { in: auditIds } } });
    if (created) { await db.userSession.deleteMany({ where: { userId: { in: [userId, otherId] } } }); await db.identityUser.deleteMany({ where: { id: { in: [userId, otherId] } } }); }
    await db.$disconnect();
  }
});
