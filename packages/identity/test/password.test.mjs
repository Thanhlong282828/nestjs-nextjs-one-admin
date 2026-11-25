import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, InvalidPasswordError } from '../dist/index.js';

test('Argon2id hashes have unique salts and verify only the right password', async () => {
  const password = 'correct horse battery staple';
  const first = await hashPassword(password), second = await hashPassword(password);
  assert.match(first, /^\$argon2id\$/); assert.notEqual(first, second);
  assert.equal(await verifyPassword(first, password), true);
  assert.equal(await verifyPassword(first, 'incorrect horse battery staple'), false);
});
test('short or excessive new passwords and invalid hashes are rejected', async () => {
  await assert.rejects(() => hashPassword('short'), InvalidPasswordError);
  await assert.rejects(() => hashPassword('a'.repeat(1025)), InvalidPasswordError);
  assert.equal(await verifyPassword('$argon2id$broken', 'something long enough'), false);
  assert.equal(await verifyPassword('$argon2i$broken', 'something long enough'), false);
  assert.equal(await verifyPassword('$argon2id$broken', 'a'.repeat(1025)), false);
});
