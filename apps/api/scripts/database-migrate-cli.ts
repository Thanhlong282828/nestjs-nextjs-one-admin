import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createConnection } from 'mariadb';
import { parseTarget } from './database-report';
import { loadMigrationRegistry, verifyMigrationHistory, type AppliedMigration } from './migration-integrity';

type BackupEvidence = { archive: string; key: string; hash: string; verified: boolean; verifiedAt: string };

async function migrate(): Promise<void> {
  const runtime = parseTarget(process.env.DATABASE_URL);
  const migration = parseTarget(process.env.MIGRATION_DATABASE_URL);
  if (process.env.NODE_ENV !== 'development' || runtime.kind !== 'mysql' || migration.kind !== 'mysql' || runtime.url.hostname !== '127.0.0.1' || runtime.url.port !== '3306' || runtime.database !== 'aurum_nestjs' || runtime.url.username !== 'nestjs' || migration.url.hostname !== runtime.url.hostname || migration.url.port !== runtime.url.port || migration.database !== runtime.database || migration.url.username !== 'nestjs_migrate') throw new Error('Unsupported target or principals; refusing migration');
  const evidencePath = process.env.AURUM_BACKUP_EVIDENCE;
  if (!evidencePath) throw new Error('Verified fresh backup evidence is required');
  const evidence = JSON.parse(readFileSync(evidencePath, 'utf8')) as BackupEvidence;
  if (!evidence.verified || !evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt)) || Date.now() - Date.parse(evidence.verifiedAt) > 86400000 || Date.parse(evidence.verifiedAt) > Date.now() || !evidence.archive.includes('/.aurum-local-backups/development-v51-') || !evidence.key.includes('/.aurum-local-backup-keys/development-v51-')) throw new Error('Backup evidence is invalid or expired');
  if (createHash('sha256').update(readFileSync(evidence.archive)).digest('hex') !== evidence.hash) throw new Error('Backup checksum mismatch');
  if (spawnSync('age', ['-d', '-i', evidence.key, evidence.archive], { stdio: 'ignore' }).status !== 0) throw new Error('Backup decryption failed');
  console.log('Migration target: mysql 127.0.0.1:3306/aurum_nestjs; environment=development; principal=nestjs_migrate; stream=mysql-app-migrations');
  const db = await createConnection({ host: migration.url.hostname, port: 3306, user: decodeURIComponent(migration.url.username), password: decodeURIComponent(migration.url.password), database: migration.database, connectTimeout: 5000 });
  try {
    const identity = await db.query<Array<{ db: string; principal: string }>>('SELECT DATABASE() AS db, CURRENT_USER() AS principal');
    if (identity[0]?.db !== 'aurum_nestjs' || identity[0]?.principal !== 'nestjs_migrate@localhost') throw new Error('Actual database identity mismatch');
    const registry = loadMigrationRegistry(resolve('apps/api/prisma/mysql-app-migrations'));
    const history = await db.query<AppliedMigration[]>('SELECT migration_name, checksum, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at, migration_name');
    verifyMigrationHistory(registry, history);
    console.log(`Migration registry verified: ${registry.length} application migrations, ${history.filter(row => row.finished_at !== null && row.rolled_back_at === null).length} applied`);
  } finally { await db.end(); }
  const result = spawnSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--config', 'prisma.app.config.ts'], { cwd: resolve('apps/api'), env: process.env, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Prisma migration failed with exit ${String(result.status)}; inspect migration history before retry`);
}

migrate().catch(error => { console.error(`Migration stopped: ${error instanceof Error ? error.message : 'unknown error'}`); process.exitCode = 1; });
