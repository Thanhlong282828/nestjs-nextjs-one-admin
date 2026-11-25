import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test port');
  const port = address.port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function withServer(databaseUrl, callback) {
  const port = await availablePort();
  const env = { ...process.env, AURUM_API_PORT: String(port), DATABASE_URL: databaseUrl };
  const server = spawn(process.execPath, ['--import', 'tsx', 'src/main.ts'], { stdio: 'ignore', env });
  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error('API exited before becoming ready');
      try { response = await fetch(`http://127.0.0.1:${port}/health`); break; }
      catch { await delay(100); }
    }
    assert.ok(response, 'API did not start');
    await callback(`http://127.0.0.1:${port}`, response);
  } finally {
    server.kill('SIGTERM');
    if (server.exitCode === null) await Promise.race([new Promise(resolve => server.once('exit', resolve)), delay(3000)]);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
}

test('liveness remains available and readiness fails closed when database is unavailable', async () => {
  await withServer('mysql://invalid:invalid@127.0.0.1:1/unavailable', async (base, response) => {
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-powered-by'), null);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'aurum-api' });
    const ready = await fetch(`${base}/health/ready`);
    assert.equal(ready.status, 503);
    assert.equal(ready.headers.get('cache-control'), 'no-store');
    const body = await ready.text();
    assert.ok(!body.includes('invalid:invalid'));
  });
});

test('readiness checks a real MySQL connection', { skip: !process.env.MYSQL_TEST_DATABASE_URL && 'Set MYSQL_TEST_DATABASE_URL for the integration test' }, async () => {
  await withServer(process.env.MYSQL_TEST_DATABASE_URL, async base => {
    const ready = await fetch(`${base}/health/ready`);
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { status: 'ok' });
  });
});
