import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { hashPassword, VerifyCredentials } from '../dist/index.js';

test('credential verification uses normalized email and rejects missing, disabled and incorrect accounts', async () => {
  const userId = randomUUID(), validHash = await hashPassword('correct-password-123'), dummyHash = await hashPassword('dummy-password-456');
  let status = 'active', calls = 0;
  const reader = { async findByEmail(email) { calls++; return email === 'test@example.test' ? { userId, passwordHash: validHash, status } : null; } };
  const verifier = new VerifyCredentials(reader, dummyHash);
  assert.deepEqual(await verifier.execute(' TEST@example.test ', 'correct-password-123'), { userId });
  assert.equal(await verifier.execute('test@example.test', 'wrong-password'), null);
  assert.equal(await verifier.execute('absent@example.test', 'correct-password-123'), null);
  status = 'disabled'; assert.equal(await verifier.execute('test@example.test', 'correct-password-123'), null);
  const before = calls; assert.equal(await verifier.execute('invalid-email', 'anything'), null); assert.equal(calls, before);
  assert.throws(() => new VerifyCredentials(reader, 'invalid'));
});
