import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OriginCsrfGuard } from '../src/identity/http/origin-csrf.guard';
import { LoginRateLimitGuard } from '../src/identity/http/login-rate-limit.guard';

class ProbeController {
  write(): { ok: boolean } { return { ok: true }; }
  read(): { ok: boolean } { return { ok: true }; }
}
Controller('probe')(ProbeController);
const writeDescriptor = Object.getOwnPropertyDescriptor(ProbeController.prototype, 'write');
const readDescriptor = Object.getOwnPropertyDescriptor(ProbeController.prototype, 'read');
if (!writeDescriptor || !readDescriptor) throw new Error('Probe methods missing');
Post()(ProbeController.prototype, 'write', writeDescriptor);
UseGuards(new OriginCsrfGuard(['https://admin.example.test']), new LoginRateLimitGuard(2, 60_000))(ProbeController.prototype, 'write', writeDescriptor);
Get()(ProbeController.prototype, 'read', readDescriptor);
class TestModule {}
Module({ controllers: [ProbeController] })(TestModule);

test('real Nest HTTP rejects missing/wrong CSRF origins and limits requests', async () => {
  const app = await NestFactory.create(TestModule, { logger: false, abortOnError: false });
  try {
    await app.listen(0, '127.0.0.1');
    const url = `${await app.getUrl()}/probe`;
    assert.equal((await fetch(url, { method: 'POST' })).status, 403);
    assert.equal((await fetch(url, { method: 'POST', headers: { origin: 'https://attacker.example.test', 'x-aurum-request': '1' } })).status, 403);
    assert.equal((await fetch(url, { method: 'POST', headers: { origin: 'https://admin.example.test' } })).status, 403);
    const headers = { origin: 'https://admin.example.test', 'x-aurum-request': '1', 'x-forwarded-for': '192.0.2.1' };
    assert.equal((await fetch(url, { method: 'POST', headers })).status, 201);
    assert.equal((await fetch(url, { method: 'POST', headers: { ...headers, 'x-forwarded-for': '192.0.2.2' } })).status, 201);
    assert.equal((await fetch(url, { method: 'POST', headers: { ...headers, 'x-forwarded-for': '192.0.2.3' } })).status, 429);
    assert.equal((await fetch(url)).status, 200);
  } finally { await app.close(); }
});
