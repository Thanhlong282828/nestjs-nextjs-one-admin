import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaSessionStore } from '../src/identity/prisma-session.store.ts';
import { PrismaIdentityQueryStore } from '../src/identity/prisma-identity-query.store.ts';
import { SessionService, GetCurrentUserQuery, GetCurrentUserQueryHandler, GetUserSessionsQuery, GetUserSessionsQueryHandler, RevokeSessionCommand, RevokeSessionCommandHandler } from '@aurum/identity';

const testUrl=process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
test('MySQL session store persists only hashes and enforces owner, expiry and revocation', {skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test'}, async () => {
  const u=new URL(testUrl);
  if(u.protocol!=='mysql:' || u.hostname!=='127.0.0.1' || !['3306','3307'].includes(u.port) || u.pathname!=='/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const client=new PrismaClient({adapter:new PrismaMariaDb(testUrl)}), userId=randomUUID(), another=randomUUID(), rollback=new Error('ROLLBACK_TEST_ONLY');
  try {
    const actual=await client.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db,'aurum_nestjs_test');
    await assert.rejects(client.$transaction(async tx => {
      await tx.identityUser.create({data:{id:userId,email:`${userId}@example.test`,passwordHash:'test-only-not-a-login'}});
      const service=new SessionService(new PrismaSessionStore(tx));
      const now=new Date('2026-01-01T00:00:00.000Z'), issued=await service.issue(userId,now), other=await service.issue(userId,now);
      const stored=await tx.userSession.findUniqueOrThrow({where:{id:issued.id}});
      assert.notEqual(stored.tokenHash,issued.token); assert.equal(stored.tokenHash.length,64);
      assert.equal((await service.authenticate(issued.token,now))?.userId,userId);
      assert.equal(await service.authenticate(issued.token,issued.expiresAt),null);
      await tx.identityUser.update({where:{id:userId},data:{status:'disabled'}});
      assert.equal(await service.authenticate(issued.token,now),null);
      await tx.identityUser.update({where:{id:userId},data:{status:'active'}});
      assert.equal(await service.revokeOwnedSession(another,issued.id,now),false);
      assert.equal(await service.revokeOwnedSession(userId,issued.id,now),true);
      assert.equal(await service.authenticate(issued.token,now),null);
      assert.equal(await service.revokeAll(userId,now),1);
      assert.equal(await service.authenticate(other.token,now),null);
      throw rollback;
    }), error => error===rollback);
    assert.equal(await client.identityUser.count({where:{id:userId}}),0);
  } finally { await client.$disconnect(); }
});

test('session queries return only current active user sessions without secret hashes', {skip: !testUrl && 'Set MYSQL_MIGRATION_TEST_DATABASE_URL for isolated MySQL test'}, async () => {
  const u = new URL(testUrl);
  if (u.protocol !== 'mysql:' || u.hostname !== '127.0.0.1' || !['3306', '3307'].includes(u.port) || u.pathname !== '/aurum_nestjs_test' || u.search || u.hash) throw Error('Refusing unapproved test database');
  const client = new PrismaClient({ adapter: new PrismaMariaDb(testUrl) }), userId = randomUUID(), otherId = randomUUID(), rollback = new Error('ROLLBACK_TEST_ONLY');
  try {
    const actual = await client.$queryRaw`SELECT DATABASE() AS db`;
    assert.equal(actual[0]?.db, 'aurum_nestjs_test');
    await assert.rejects(client.$transaction(async tx => {
      await tx.identityUser.createMany({ data: [{ id: userId, email: `${userId}@example.test`, passwordHash: 'test-only' }, { id: otherId, email: `${otherId}@example.test`, passwordHash: 'test-only' }] });
      const service = new SessionService(new PrismaSessionStore(tx)), store = new PrismaIdentityQueryStore(tx);
      const current = await service.issue(userId), revoked = await service.issue(userId), other = await service.issue(otherId);
      const revoke = new RevokeSessionCommandHandler(service);
      assert.equal(await revoke.execute(new RevokeSessionCommand(current.token, other.id)), false);
      assert.ok(await service.authenticate(other.token));
      assert.equal(await revoke.execute(new RevokeSessionCommand(current.token, revoked.id)), true);
      const me = new GetCurrentUserQueryHandler(service, store), list = new GetUserSessionsQueryHandler(service, store);
      assert.deepEqual(await me.execute(new GetCurrentUserQuery(current.token)), { id: userId, email: `${userId}@example.test` });
      const result = await list.execute(new GetUserSessionsQuery(current.token));
      assert.equal(result.length, 1); assert.equal(result[0].id, current.id); assert.equal(result[0].current, true);
      assert.equal('tokenHash' in result[0], false); assert.equal(result.some(item => item.id === other.id), false);
      assert.equal(await me.execute(new GetCurrentUserQuery(revoked.token)), null);
      assert.equal(await list.execute(new GetUserSessionsQuery(revoked.token)), null);
      await tx.identityUser.update({ where: { id: userId }, data: { status: 'disabled' } });
      assert.equal(await me.execute(new GetCurrentUserQuery(current.token)), null);
      assert.equal(await list.execute(new GetUserSessionsQuery(current.token)), null);
      throw rollback;
    }), error => error === rollback);
    assert.equal(await client.identityUser.count({ where: { id: { in: [userId, otherId] } } }), 0);
  } finally { await client.$disconnect(); }
});
