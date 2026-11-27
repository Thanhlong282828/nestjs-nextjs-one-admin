import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword } from '@aurum/identity';
const require = createRequire(__filename);
const { AuthHttpModule } = require('../dist/identity/http/auth-http.module.js') as typeof import('../src/identity/http/auth-http.module');

test('auth HTTP module logs in with a real MySQL test user and revokes session', { skip: !process.env.MYSQL_MIGRATION_TEST_DATABASE_URL && 'Set isolated test database URL' }, async () => {
  const url = process.env.MYSQL_MIGRATION_TEST_DATABASE_URL;
  if (!url) throw new Error('Missing test database URL');
  const parsed = new URL(url);
  if (parsed.protocol !== 'mysql:' || parsed.hostname !== '127.0.0.1' || !['3306', '3307'].includes(parsed.port) || parsed.pathname !== '/aurum_nestjs_test' || parsed.search || parsed.hash) throw new Error('Refusing unapproved test database');
  const db = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  const userId = randomUUID(), email = `${userId}@example.test`;
  const auditIds: string[] = [];
  let app: Awaited<ReturnType<typeof NestFactory.create>> | undefined;
  let created = false;
  try {
    const selected = await db.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`;
    assert.equal(selected[0]?.db, 'aurum_nestjs_test');
    const password = 'correct-password-123';
    await db.identityUser.create({ data: { id: userId, email, passwordHash: await hashPassword(password) } });
    created = true;
    const dummy = await hashPassword('dummy-password-456');
    class TestApp {}
    Module({ imports: [AuthHttpModule.forClient(db, dummy, ['https://admin.example.test'], true, () => { const id = randomUUID(); auditIds.push(id); return id; })] })(TestApp);
    app = await NestFactory.create(TestApp, { logger: false, abortOnError: false });
    await app.listen(0, '127.0.0.1');
    const base = `${await app.getUrl()}/api/v1/auth`;
    const headers = { origin: 'https://admin.example.test', 'x-aurum-request': '1', 'content-type': 'application/json' };
    const payload = JSON.stringify({ email, password });
    assert.equal((await fetch(`${base}/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: payload })).status, 403);
    assert.equal((await fetch(`${base}/login`, { method: 'POST', headers: { ...headers, origin: 'https://attacker.example.test' }, body: payload })).status, 403);
    const failedPassword = await fetch(`${base}/login`, { method: 'POST', headers, body: JSON.stringify({ email, password: 'incorrect-password' }) });
    const missingUser = await fetch(`${base}/login`, { method: 'POST', headers, body: JSON.stringify({ email: `${randomUUID()}@example.test`, password }) });
    assert.equal(failedPassword.status, 401);
    assert.equal(missingUser.status, 401);
    assert.deepEqual(await failedPassword.json(), await missingUser.json());
    await db.identityUser.update({ where: { id: userId }, data: { status: 'disabled' } });
    assert.equal((await fetch(`${base}/login`, { method: 'POST', headers, body: payload })).status, 401);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'active' } });
    assert.equal(await db.authenticationAudit.count({ where: { id: { in: auditIds }, event: 'login_failure' } }), 3);
    const login = await fetch(`${base}/login`, { method: 'POST', headers, body: payload });
    assert.equal(login.status, 200);
    assert.deepEqual(await login.json(), { authenticated: true });
    const setCookie = login.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /Secure/i);
    assert.match(setCookie, /SameSite=Strict/i);
    const cookie = setCookie.split(';')[0];
    assert.ok(cookie);
    const session = await db.userSession.findFirstOrThrow({ where: { userId } });
    assert.ok(!setCookie.includes(session.tokenHash));
    assert.equal((await db.authenticationAudit.count({ where: { userId, event: 'login_success' } })), 1);
    const me = await fetch(`${base}/me`, { headers: { cookie } });
    assert.equal(me.status, 200);
    assert.deepEqual(await me.json(), { id: userId, email });
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: 'aurum_session=broken' } })).status, 401);
    const token = cookie.split('=')[1];
    assert.ok(token);
    const tampered = `aurum_session=${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: tampered } })).status, 401);
    const rotated = await fetch(`${base}/login`, { method: 'POST', headers: { ...headers, cookie }, body: payload });
    assert.equal(rotated.status, 200);
    const rotatedCookie = rotated.headers.get('set-cookie')?.split(';')[0];
    assert.ok(rotatedCookie);
    assert.equal((await fetch(`${base}/me`, { headers: { cookie } })).status, 401);
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: rotatedCookie } })).status, 200);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'disabled' } });
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: rotatedCookie } })).status, 401);
    await db.identityUser.update({ where: { id: userId }, data: { status: 'active' } });
    const rotatedSession = await db.userSession.findFirstOrThrow({ where: { userId, revokedAt: null } });
    await db.userSession.update({ where: { id: rotatedSession.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: rotatedCookie } })).status, 401);
    const third = await fetch(`${base}/login`, { method: 'POST', headers, body: payload });
    const thirdCookie = third.headers.get('set-cookie')?.split(';')[0];
    assert.equal(third.status, 200);
    assert.ok(thirdCookie);
    const logouts = await Promise.all([1, 2].map(() => fetch(`${base}/logout`, { method: 'POST', headers: { ...headers, cookie: thirdCookie } })));
    assert.deepEqual(logouts.map(result => result.status).sort(), [204, 401]);
    assert.equal((await fetch(`${base}/me`, { headers: { cookie: thirdCookie } })).status, 401);
    for (let index = 0; index < 4; index++) {
      assert.equal((await fetch(`${base}/login`, { method: 'POST', headers: { ...headers, 'x-forwarded-for': `192.0.2.${index}` }, body: JSON.stringify({ email, password: 'incorrect-password' }) })).status, 401);
    }
    assert.equal((await fetch(`${base}/login`, { method: 'POST', headers: { ...headers, 'x-forwarded-for': '192.0.2.250' }, body: payload })).status, 429);
    assert.equal(await db.authenticationAudit.count({ where: { id: { in: auditIds }, event: 'login_failure' } }), 7);
    assert.equal((await fetch(`${base}/me`, { headers: { cookie } })).status, 401);
    assert.ok((await db.userSession.findUniqueOrThrow({ where: { id: session.id } })).revokedAt);
  } finally {
    await app?.close();
    if (created) {
      await db.authenticationAudit.deleteMany({ where: { OR: [{ userId }, { id: { in: auditIds } }] } });
      await db.userSession.deleteMany({ where: { userId } });
      await db.identityUser.deleteMany({ where: { id: userId } });
    }
    await db.$disconnect();
  }
});
