import { test } from 'node:test';
import assert from 'node:assert/strict';
import { developmentDatabaseUrl } from '../scripts/development-target.mjs';

const env = { NODE_ENV: 'development', AURUM_ALLOW_DEVELOPMENT_SEED: '1', DATABASE_URL: 'mysql://nestjs:example@127.0.0.1:3306/aurum_nestjs' };
test('development seed target rejects production, test, remote and privileged users', () => {
  assert.equal(developmentDatabaseUrl(env), env.DATABASE_URL);
  for (const changed of [
    {NODE_ENV: 'production'}, {NODE_ENV: ''}, {AURUM_ALLOW_DEVELOPMENT_SEED: ''},
    {DATABASE_URL: 'mysql://nestjs:example@127.0.0.1:3306/aurum_nestjs_test'},
    {DATABASE_URL: 'mysql://nestjs:example@127.0.0.1:3306/aurum_nestjs_demo'},
    {DATABASE_URL: 'mysql://root:example@127.0.0.1:3306/aurum_nestjs'},
    {DATABASE_URL: 'mysql://nestjs:example@db.example.com:3306/aurum_nestjs'},
    {DATABASE_URL: 'mysql://nestjs:example@127.0.0.1:3306/aurum_nestjs?ssl=false'},
    {DATABASE_URL: 'not-a-url'},
  ]) assert.throws(() => developmentDatabaseUrl({ ...env, ...changed }));
});
