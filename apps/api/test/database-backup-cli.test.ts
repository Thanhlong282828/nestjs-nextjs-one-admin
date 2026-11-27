import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

test('backup refuses production or mismatched targets before writing and conceals secrets', () => {
  const cli = resolve(process.cwd(), 'scripts/database-backup-cli.ts');
  for (const env of [
    { NODE_ENV: 'production', DATABASE_URL: 'mysql://nestjs:secret@127.0.0.1:3306/aurum_nestjs', MIGRATION_DATABASE_URL: 'mysql://nestjs_migrate:secret@127.0.0.1:3306/aurum_nestjs' },
    { NODE_ENV: 'development', DATABASE_URL: 'mysql://nestjs:secret@127.0.0.1:3306/aurum_nestjs', MIGRATION_DATABASE_URL: 'mysql://root:secret@127.0.0.1:3306/aurum_nestjs' },
    { NODE_ENV: 'development', DATABASE_URL: 'postgresql://nestjs:secret@127.0.0.1:5432/aurum_nestjs', MIGRATION_DATABASE_URL: 'postgresql://nestjs_migrate:secret@127.0.0.1:5432/aurum_nestjs' },
  ]) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', cli], { encoding: 'utf8', env: { ...process.env, ...env } });
    assert.notEqual(result.status, 0);
    assert.doesNotMatch(result.stdout + result.stderr, /secret/);
    assert.match(result.stderr, /Backup failed/);
  }
});
