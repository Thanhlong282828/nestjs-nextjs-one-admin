import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { GetCurrentUserQuery, GetCurrentUserQueryHandler, GetUserSessionsQuery, GetUserSessionsQueryHandler } from '../dist/index.js';

test('identity queries derive the user from an authenticated session and never trust request IDs', async () => {
  const userId = randomUUID(), sessionId = randomUUID(), seen = [];
  const session = { async authenticate(token) { return token === 'valid' ? { userId, sessionId } : null; } };
  const store = {
    async findActiveUser(id) { seen.push(id); return { id, email: 'unit@example.test' }; },
    async findActiveSessions(id) { seen.push(id); return [{ id: sessionId, createdAt: new Date(0), expiresAt: new Date(1) }]; },
  };
  const me = new GetCurrentUserQueryHandler(session, store), list = new GetUserSessionsQueryHandler(session, store);
  assert.equal(await me.execute(new GetCurrentUserQuery('invalid')), null);
  assert.equal(await list.execute(new GetUserSessionsQuery('invalid')), null);
  assert.deepEqual(seen, []);
  assert.equal((await me.execute(new GetCurrentUserQuery('valid'))).id, userId);
  assert.equal((await list.execute(new GetUserSessionsQuery('valid')))[0].current, true);
  assert.deepEqual(seen, [userId, userId]);
});
