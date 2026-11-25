import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { LogoutCommand, LogoutCommandHandler, LogoutAllCommand, LogoutAllCommandHandler, RevokeSessionCommand, RevokeSessionCommandHandler, SessionService } from '../dist/index.js';

function makeStore() {
  const rows = new Map();
  return {
    async create(record) { rows.set(record.tokenHash, { ...record, revokedAt: null, userStatus: 'active' }); },
    async findByTokenHash(hash) { return rows.get(hash) ?? null; },
    async revokeByIdForUser(id, userId, at) {
      const row = [...rows.values()].find(item => item.id === id && item.userId === userId && !item.revokedAt);
      if (!row) return false;
      row.revokedAt = at; return true;
    },
    async revokeAllForUser(userId, at) {
      let count = 0;
      for (const row of rows.values()) if (row.userId === userId && !row.revokedAt) { row.revokedAt = at; count++; }
      return count;
    },
  };
}

test('logout only revokes the authenticated current session and rejects reuse', async () => {
  const sessions = new SessionService(makeStore());
  const userId = randomUUID();
  const current = await sessions.issue(userId), other = await sessions.issue(userId);
  const handler = new LogoutCommandHandler(sessions);
  assert.equal(await handler.execute(new LogoutCommand(current.token)), true);
  assert.equal(await handler.execute(new LogoutCommand(current.token)), false);
  assert.equal(await sessions.authenticate(current.token), null);
  assert.ok(await sessions.authenticate(other.token));
  assert.equal(await handler.execute(new LogoutCommand('invalid')), false);
});

test('logout all derives the owner from the session and leaves other users untouched', async () => {
  const sessions = new SessionService(makeStore());
  const userId = randomUUID();
  const current = await sessions.issue(userId), other = await sessions.issue(userId), unrelated = await sessions.issue(randomUUID());
  const handler = new LogoutAllCommandHandler(sessions);
  assert.equal(await handler.execute(new LogoutAllCommand(current.token)), true);
  assert.equal(await sessions.authenticate(current.token), null);
  assert.equal(await sessions.authenticate(other.token), null);
  assert.ok(await sessions.authenticate(unrelated.token));
  assert.equal(await handler.execute(new LogoutAllCommand(current.token)), false);
});

test('session revocation denies cross-user targets and tokens no longer valid', async () => {
  const sessions = new SessionService(makeStore());
  const userId = randomUUID();
  const current = await sessions.issue(userId), target = await sessions.issue(userId), other = await sessions.issue(randomUUID());
  const handler = new RevokeSessionCommandHandler(sessions);
  assert.equal(await handler.execute(new RevokeSessionCommand(current.token, other.id)), false);
  assert.ok(await sessions.authenticate(other.token));
  assert.equal(await handler.execute(new RevokeSessionCommand(current.token, target.id)), true);
  assert.equal(await sessions.authenticate(target.token), null);
  assert.equal(await handler.execute(new RevokeSessionCommand(target.token, current.id)), false);
  assert.ok(await sessions.authenticate(current.token));
  assert.equal(await handler.execute(new RevokeSessionCommand(current.token, 'invalid')), false);
});
