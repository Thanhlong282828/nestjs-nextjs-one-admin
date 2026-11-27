import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream, mkdtempSync, mkdirSync, statSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { createConnection } from 'mariadb';
import { parseTarget } from './database-report';

async function main(): Promise<void> {
  const runtime = parseTarget(process.env.DATABASE_URL);
  const migration = parseTarget(process.env.MIGRATION_DATABASE_URL);
  if (process.env.NODE_ENV !== 'development' || runtime.kind !== 'mysql' || migration.kind !== 'mysql' || runtime.url.hostname !== '127.0.0.1' || runtime.url.port !== '3306' || runtime.database !== 'aurum_nestjs' || runtime.url.username !== 'nestjs' || migration.url.hostname !== runtime.url.hostname || migration.url.port !== runtime.url.port || migration.database !== runtime.database || migration.url.username !== 'nestjs_migrate') throw new Error('Refusing unsupported backup target or principals');
  const db = await createConnection({ host: migration.url.hostname, port: 3306, user: migration.url.username, password: decodeURIComponent(migration.url.password), database: migration.database, connectTimeout: 5000 });
  try {
    const identity = await db.query<Array<{ db: string; principal: string }>>('SELECT DATABASE() db, CURRENT_USER() principal');
    if (identity[0]?.db !== migration.database || identity[0]?.principal !== 'nestjs_migrate@localhost') throw new Error('Backup identity mismatch');
  } finally { await db.end(); }
  console.log('Backup source: mysql 127.0.0.1:3306/aurum_nestjs; environment=development; principal=nestjs_migrate');
  const keyDir = resolve('.aurum-local-backup-keys'), backupDir = resolve('.aurum-local-backups');
  mkdirSync(keyDir, { recursive: true, mode: 0o700 }); mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const temp = mkdtempSync(join(tmpdir(), 'aurum-backup-')); chmodSync(temp, 0o700);
  const id = randomUUID(), key = join(keyDir, `development-v52-${id}.identity`), partial = join(backupDir, `INCOMPLETE-do-not-restore-v52-${id}.sql.age`);
  const cfg = join(temp, 'client.cnf');
  try {
    const password = decodeURIComponent(migration.url.password);
    if (/[\r\n\0]/.test(password)) throw new Error('Unsupported credential format');
    const { writeFileSync, renameSync } = await import('node:fs');
    writeFileSync(cfg, `[client]\nhost=127.0.0.1\nport=3306\nuser=nestjs_migrate\npassword="${password.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"\n`, { mode: 0o600 });
    const keygen = spawnSync('age-keygen', ['-o', key], { stdio: 'ignore' });
    if (keygen.status !== 0) throw new Error('Backup key creation failed');
    chmodSync(key, 0o600);
    const publicKey = spawnSync('age-keygen', ['-y', key], { encoding: 'utf8' });
    if (publicKey.status !== 0 || !/^age1[a-z0-9]+\s*$/.test(publicKey.stdout)) throw new Error('Backup public key unavailable');
    const dump = spawn('mysqldump', [`--defaults-extra-file=${cfg}`, '--single-transaction', '--skip-lock-tables', '--no-tablespaces', '--set-gtid-purged=OFF', '--databases', migration.database], { stdio: ['ignore', 'pipe', 'pipe'] });
    const encrypt = spawn('age', ['-r', publicKey.stdout.trim()], { stdio: ['pipe', 'pipe', 'pipe'] });
    const status = (child: ChildProcess): Promise<number | null> => new Promise((resolveStatus, reject) => { child.once('error', reject); child.once('close', resolveStatus); });
    const dumpStatus = status(dump), encryptStatus = status(encrypt);
    dump.stderr.resume(); encrypt.stderr.resume();
    const transfer = pipeline(dump.stdout, encrypt.stdin);
    const output = pipeline(encrypt.stdout, createWriteStream(partial, { mode: 0o600, flags: 'wx' }));
    await Promise.all([transfer, output]);
    if (await dumpStatus !== 0 || await encryptStatus !== 0) throw new Error('Dump or encryption failed; incomplete artifact retained');
    const decrypt = spawnSync('age', ['-d', '-i', key, partial], { stdio: 'ignore' });
    if (decrypt.status !== 0) throw new Error('Decrypt check failed; incomplete artifact retained');
    const hash = createHash('sha256'); await pipeline(createReadStream(partial), hash);
    const archive = join(backupDir, `development-v52-${id}.sql.age`); renameSync(partial, archive);
    const sha256 = hash.digest('hex');
    if (statSync(archive).size === 0) throw new Error('Empty archive');
    console.log(JSON.stringify({ archive, sha256, encrypted: true, decryptVerified: true, restoreVerified: false, note: 'Do not use as migration/provisioning restore evidence until independently restored and compared.' }));
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
main().catch(() => { console.error('Backup failed; no verified restore evidence was created.'); process.exitCode = 1; });
