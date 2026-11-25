import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { LoginCommand, LoginCommandHandler, VerifyCredentials, hashPassword } from '../dist/index.js';

test('login issues distinct secret tokens and never returns stored hashes', async () => {
  const userId = randomUUID(), hash = await hashPassword('correct-password-123'), dummy = await hashPassword('dummy-password-456');
  let changed = false, failures = 0; const sessions = [];
  const verifier = new VerifyCredentials({ async findByEmail(email) { return email === 'test@example.test' ? { userId, passwordHash: hash, status: 'active' } : null; } }, dummy);
  const store = { async recordFailure() { failures++; }, async createSessionIfUnchanged(input) { assert.equal(input.expectedPasswordHash, hash); if (changed) return false; sessions.push(input.session); return true; } };
  const handler = new LoginCommandHandler(verifier, store);
  assert.equal(await handler.execute(new LoginCommand('test@example.test', 'incorrect')), null);
  assert.equal(await handler.execute(new LoginCommand('missing@example.test', 'correct-password-123')), null);
  const result = await handler.execute(new LoginCommand('test@example.test', 'correct-password-123'));
  assert.equal(sessions[0].tokenHash, createHash('sha256').update(result.token).digest('hex'));
  assert.equal('tokenHash' in result, false); assert.equal('passwordHash' in result, false);
  changed = true; assert.equal(await handler.execute(new LoginCommand('test@example.test', 'correct-password-123')), null);
  assert.equal(failures, 3);
});
