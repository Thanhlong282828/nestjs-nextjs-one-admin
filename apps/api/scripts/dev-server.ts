import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { parseEnv } from 'node:util';
import { runtimeEnvironment } from './runtime-environment';

const path = resolve(process.cwd(), '../../.env.mysql');
const file = existsSync(path) ? parseEnv(readFileSync(path, 'utf8')) : {};
const env = runtimeEnvironment({ ...file, ...process.env });
const child = spawn(process.execPath, ['--import', 'tsx', '--watch', 'src/main.ts'], { stdio: 'inherit', env });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => child.kill(signal));
child.on('error', () => { process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
