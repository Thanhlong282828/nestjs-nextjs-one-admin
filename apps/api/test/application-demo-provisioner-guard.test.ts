import { test } from 'node:test';
import assert from 'node:assert/strict';
import { provisionApplicationDemo } from '../scripts/application-demo-provisioner';

test('DEMO test provisioner refuses development, production and unexpected test targets before connecting', async () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'test';
    for (const url of [
      'mysql://aurum_app_migrator:example@127.0.0.1:3306/aurum_nestjs',
      'mysql://aurum_app_migrator:example@127.0.0.1:3308/aurum_nestjs',
      'mysql://aurum_app_migrator:example@remote.example:3308/aurum_nestjs_test',
      'postgresql://aurum_app_migrator:example@127.0.0.1:3308/aurum_nestjs_test',
      'mysql://root:example@127.0.0.1:3308/aurum_nestjs_test',
    ]) await assert.rejects(provisionApplicationDemo(url, 'a-long-test-password'), /Refusing non-test target/);
    process.env.NODE_ENV = 'production';
    await assert.rejects(provisionApplicationDemo('mysql://aurum_app_migrator:example@127.0.0.1:3308/aurum_nestjs_test', 'a-long-test-password'), /Refusing non-test target/);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
