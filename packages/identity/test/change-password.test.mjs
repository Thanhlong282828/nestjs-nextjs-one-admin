import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { ChangePasswordCommand, ChangePasswordCommandHandler, hashPassword, verifyPassword } from '../dist/index.js';

test('change password validates the session and current password before changing anything', async () => {
  const userId = randomUUID(), sessionId = randomUUID(), currentHash = await hashPassword('current-password-123');
  let authenticated = false, writes = 0, saved;
  const sessions = { async authenticate() { return authenticated ? { userId, sessionId } : null; } };
  const store = { async findActivePasswordHash(id) { assert.equal(id, userId); return currentHash; }, async replaceAndRevoke(input) { writes++; saved = input; return true; } };
  const handler = new ChangePasswordCommandHandler(sessions, store);
  assert.equal(await handler.execute(new ChangePasswordCommand('invalid', 'current-password-123', 'updated-password-456')), false);
  authenticated = true;
  assert.equal(await handler.execute(new ChangePasswordCommand('token', 'wrong-password', 'updated-password-456')), false);
  await assert.rejects(handler.execute(new ChangePasswordCommand('token', 'current-password-123', 'short')));
  assert.equal(writes, 0);
  assert.equal(await handler.execute(new ChangePasswordCommand('token', 'current-password-123', 'updated-password-456')), true);
  assert.equal(writes, 1); assert.equal(saved.userId, userId); assert.equal(saved.sessionId, sessionId); assert.equal(saved.previousHash, currentHash);
  assert.equal(await verifyPassword(saved.nextHash, 'updated-password-456'), true);
  assert.equal(await verifyPassword(saved.nextHash, 'current-password-123'), false);
});
