import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const cli = resolve(process.cwd(), 'scripts/database-provision-cli.ts');
function run(environment: string, url: string, ...args: string[]) {
  return spawnSync(process.execPath, ['--import', 'tsx', cli, ...args], { encoding: 'utf8', env: { ...process.env, NODE_ENV: environment, DATABASE_URL: url } });
}
test('provision CLI rejects production, wrong environment and conflicting flags before connecting', () => {
  for (const result of [
    run('production', 'mysql://runtime:secret@127.0.0.1:3306/aurum_nestjs', '--execute'),
    run('development', 'mysql://runtime:secret@127.0.0.1:3306/aurum_nestjs_test', '--execute'),
    run('test', 'mysql://runtime:secret@127.0.0.1:3306/aurum_nestjs', '--execute'),
    run('development', 'mysql://runtime:secret@127.0.0.1:3306/aurum_nestjs', '--dry-run', '--execute'),
  ]) {
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout + result.stderr, /secret/);
  }
});
test('PostgreSQL writes explicitly fail before any connection or fallback', () => {
  const result = run('development', 'postgresql://runtime:secret@127.0.0.1:5432/aurum_dev', '--execute');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PostgreSQL provisioning is not implemented/);
  assert.doesNotMatch(result.stdout + result.stderr, /secret/);
});
