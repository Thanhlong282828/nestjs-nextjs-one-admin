import { createHash } from 'node:crypto';
import { createReadStream, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { parseTarget } from './database-report';

async function main(): Promise<void> {
  const runtime = parseTarget(process.env.DATABASE_URL), migration = parseTarget(process.env.MIGRATION_DATABASE_URL);
  if (process.env.NODE_ENV !== 'development' || runtime.kind !== 'mysql' || migration.kind !== 'mysql' || runtime.url.hostname !== '127.0.0.1' || runtime.url.port !== '3306' || runtime.database !== 'aurum_nestjs' || runtime.url.username !== 'nestjs' || migration.url.hostname !== runtime.url.hostname || migration.url.port !== runtime.url.port || migration.database !== runtime.database || migration.url.username !== 'nestjs_migrate') throw new Error('Unsupported restore verification target');
  const id = process.env.AURUM_BACKUP_ID, expected = process.env.AURUM_BACKUP_SHA256;
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !expected || !/^[0-9a-f]{64}$/.test(expected)) throw new Error('Backup UUID and checksum required');
  const archive = resolve(`.aurum-local-backups/development-v52-${id}.sql.age`), key = resolve(`.aurum-local-backup-keys/development-v52-${id}.identity`);
  const hasher = createHash('sha256'); await pipeline(createReadStream(archive), hasher);
  if (hasher.digest('hex') !== expected) throw new Error('Backup checksum mismatch');
  if (spawnSync('age', ['-d', '-i', key, archive], { stdio: 'ignore' }).status !== 0) throw new Error('Decryption failed');
  const dir = mkdtempSync('/private/tmp/aurum-restore-check-'), datadir = join(dir, 'data'), socket = join(dir, 'mysql.sock'), pid = join(dir, 'mysql.pid'), log = join(dir, 'mysql.log'), cfg = join(dir, 'source.cnf');
  mkdirSync(datadir, { mode: 0o700 });
  const password = decodeURIComponent(migration.url.password);
  if (/[\r\n\0]/.test(password)) throw new Error('Unsupported credential format');
  writeFileSync(cfg, `[client]\nhost=127.0.0.1\nport=3306\nuser=nestjs_migrate\npassword="${password.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"\n`, { mode: 0o600 });
  const isolated = ['--no-defaults', '--protocol=socket', `--socket=${socket}`, '--user=root'];
  let started = false;
  try {
    const identity = spawnSync('mysql', [`--defaults-extra-file=${cfg}`, '--batch', '--skip-column-names', '-e', 'SELECT DATABASE(), CURRENT_USER()', migration.database], { encoding: 'utf8' });
    if (identity.status !== 0 || identity.stdout.trim() !== 'aurum_nestjs\tnestjs_migrate@localhost') throw new Error('Actual source identity mismatch');
    if (spawnSync('mysqld', ['--no-defaults', '--initialize-insecure', `--datadir=${datadir}`], { stdio: 'ignore', timeout: 120000 }).status !== 0) throw new Error('Isolated MySQL initialization failed');
    const server = spawn('mysqld', ['--no-defaults', `--datadir=${datadir}`, `--socket=${socket}`, `--pid-file=${pid}`, `--log-error=${log}`, '--skip-networking'], { detached: true, stdio: 'ignore' }); server.unref(); started = true;
    let ready = false;
    for (let i = 0; i < 30; i++) {
      if (spawnSync('mysqladmin', [...isolated, 'ping'], { stdio: 'ignore' }).status === 0) { ready = true; break; }
      await new Promise(r => setTimeout(r, 1000));
    }
    if (!ready) throw new Error('Isolated MySQL failed to start');
    console.log('Restore target: newly initialized temporary datadir, dedicated socket, --skip-networking');
    const decrypt = spawn('age', ['-d', '-i', key, archive], { stdio: ['ignore', 'pipe', 'pipe'] });
    const restore = spawn('mysql', isolated, { stdio: ['pipe', 'ignore', 'pipe'] });
    const status = (child: ChildProcess): Promise<number | null> => new Promise((ok, fail) => { child.once('error', fail); child.once('close', ok); });
    const decryptStatus = status(decrypt), restoreStatus = status(restore); decrypt.stderr.resume(); restore.stderr.resume();
    await pipeline(decrypt.stdout, restore.stdin);
    if (await decryptStatus !== 0 || await restoreStatus !== 0) throw new Error('Restore failed');
    const source = [`--defaults-extra-file=${cfg}`];
    const queries = [
      "SELECT TABLE_NAME,COLUMN_NAME,COLUMN_TYPE,IS_NULLABLE,COLUMN_KEY FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='aurum_nestjs' ORDER BY TABLE_NAME,ORDINAL_POSITION",
      "SELECT TABLE_NAME,CONSTRAINT_NAME,CONSTRAINT_TYPE FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='aurum_nestjs' ORDER BY TABLE_NAME,CONSTRAINT_NAME",
      "SELECT TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX,COLUMN_NAME,NON_UNIQUE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='aurum_nestjs' ORDER BY TABLE_NAME,INDEX_NAME,SEQ_IN_INDEX",
      "SELECT TABLE_NAME,CONSTRAINT_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='aurum_nestjs' AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY TABLE_NAME,CONSTRAINT_NAME,ORDINAL_POSITION",
    ];
    for (const query of queries) {
      const a = spawnSync('mysql', [...source, '--batch', '--skip-column-names', '-e', query], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      const b = spawnSync('mysql', [...isolated, '--batch', '--skip-column-names', '-e', query], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
      if (a.status !== 0 || b.status !== 0 || a.stdout !== b.stdout) throw new Error('Schema comparison failed');
    }
    const options = ['--skip-comments', '--skip-dump-date', '--no-create-info', '--skip-lock-tables', '--single-transaction', '--no-tablespaces', '--set-gtid-purged=OFF', migration.database];
    const a = spawnSync('mysqldump', [...source, ...options], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const b = spawnSync('mysqldump', [...isolated, ...options], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const rows = (value: string): string => value.split('\n').filter(line => line.startsWith('INSERT INTO ')).sort().join('\n');
    if (a.status !== 0 || b.status !== 0 || rows(a.stdout) !== rows(b.stdout)) throw new Error('Persisted data comparison failed');
    console.log(JSON.stringify({ checksum: expected, schema: 'matched', indexes: 'matched', foreignKeys: 'matched', rows: 'matched', database: migration.database, restoredInto: 'isolated temporary instance', note: 'Manual procedural evidence only; not an authenticated migration gate.' }));
  } finally {
    if (started && spawnSync('mysqladmin', [...isolated, 'shutdown'], { stdio: 'ignore' }).status !== 0) { console.error('Isolated MySQL shutdown failed; inspect temporary instance'); process.exitCode = 1; }
    rmSync(cfg, { force: true });
  }
}
main().catch(() => { console.error('Restore verification failed; no restore evidence was issued.'); process.exitCode = 1; });
