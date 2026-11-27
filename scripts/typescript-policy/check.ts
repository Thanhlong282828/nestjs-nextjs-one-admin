import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const generatedPaths = new Set(['apps/api/src/generated']);
const javascript = /\.(?:js|jsx|mjs|cjs)$/i;
const permittedException = /^(?:apps\/api\/scripts\/[^/]+|apps\/api\/test\/.+|packages\/[^/]+\/test\/.+)\.(?:js|jsx|mjs|cjs)$/;

type Exceptions = Readonly<Record<string, string>>;

/** Enforce application/workspace sources; root scripts and config are tooling. */
export function checkTypeScriptPolicy(root: string, exceptions: Exceptions): string[] {
  const failures: string[] = [];
  for (const [file, reason] of Object.entries(exceptions)) {
    if (!permittedException.test(file) || typeof reason !== 'string' || !reason.trim()) failures.push(`Invalid JavaScript exception: ${file}`);
  }
  function walk(relative: string): void {
    for (const entry of readdirSync(path.join(root, relative), { withFileTypes: true })) {
      const child = path.posix.join(relative, entry.name);
      if (entry.name === 'node_modules' || generatedPaths.has(child) || /^(?:apps|packages)\/[^/]+\/(?:\.next|\.next-e2e|dist|coverage)$/.test(child)) continue;
      if (entry.isSymbolicLink()) { failures.push(`Unexpected symlink in workspace: ${child}`); continue; }
      if (entry.isDirectory()) { walk(child); continue; }
      if (!javascript.test(entry.name)) continue;
      if (!Object.hasOwn(exceptions, child) || !permittedException.test(child)) failures.push(`JavaScript requires an approved tooling/test exception: ${child}`);
    }
  }
  for (const directory of ['apps', 'packages']) walk(directory);
  return failures.sort();
}

export function loadExceptions(file: string): Exceptions {
  const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid exception allowlist');
  return parsed as Exceptions;
}
