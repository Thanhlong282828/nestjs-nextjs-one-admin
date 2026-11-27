import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

test('restore verification rejects unauthorized targets and invalid backup IDs before starting a server', () => {
  const cli = resolve(process.cwd(), 'scripts/database-restore-check-cli.ts');
  const base = { ...process.env, NODE_ENV: 'development', DATABASE_URL: 'mysql://nestjs:secret@127.0.0.1:3306/aurum_nestjs', MIGRATION_DATABASE_URL: 'mysql://nestjs_migrate:secret@127.0.0.1:3306/aurum_nestjs' };
  for (const changes of [
    { NODE_ENV: 'production', AURUM_BACKUP_ID: 'not-valid' },
    { AURUM_BACKUP_ID: '../somewhere', AURUM_BACKUP_SHA256: 'bad' },
    { MIGRATION_DATABASE_URL: 'mysql://root:secret@127.0.0.1:3306/aurum_nestjs' },
  ]) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', cli], { encoding: 'utf8', env: { ...base, ...changes } });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Restore verification failed/);
    assert.doesNotMatch(result.stdout + result.stderr, /secret/);
  }
});
