import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaCredentialReader } from '../src/identity/prisma-credential.reader.ts';
import { hashPassword, VerifyCredentials } from '@aurum/identity';

const testUrl = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('credential verification uses real MySQL, rejects disabled and incorrect credentials', { skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test' }, async () => {
  const url = new URL(testUrl);
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || !['3306', '3307'].includes(url.port) || url.pathname !== '/aurum_nestjs_test' || url.search || url.hash) throw Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), id = randomUUID(), rollback = new Error('ROLLBACK_TEST_ONLY');
  try {
    const rows = await db.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(rows[0]?.db, 'aurum_nestjs_test');
    const hash = await hashPassword('correct-password-123'), dummy = await hashPassword('dummy-password-456');
    await assert.rejects(db.$transaction(async tx => {
      const email = `${id}@example.test`;
      await tx.identityUser.create({ data: { id, email, passwordHash: hash } });
      const verifier = new VerifyCredentials(new PrismaCredentialReader(tx), dummy);
      assert.deepEqual(await verifier.execute(email, 'correct-password-123'), { userId: id });
      assert.equal(await verifier.execute(email, 'incorrect-password'), null);
      assert.equal(await verifier.execute(`${randomUUID()}@example.test`, 'correct-password-123'), null);
      await tx.identityUser.update({ where: { id }, data: { status: 'disabled' } });
      assert.equal(await verifier.execute(email, 'correct-password-123'), null);
      throw rollback;
    }), error => error === rollback);
    assert.equal(await db.identityUser.count({ where: { id } }), 0);
  } finally { await db.$disconnect(); }
});
