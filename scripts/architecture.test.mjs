import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const checker = fileURLToPath(new URL('./check-architecture.mjs', import.meta.url));

test('architecture gate detects package internals and runtime cycles', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurum-architecture-test-'));
  try {
    const src = path.join(root, 'packages', 'example', 'src'); fs.mkdirSync(src, { recursive: true });
    const run = () => spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
    fs.writeFileSync(path.join(src, 'a.ts'), "import './b';\n");
    fs.writeFileSync(path.join(src, 'b.ts'), "import './a';\n");
    let result = run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /Runtime import cycle/);
    fs.writeFileSync(path.join(src, 'b.ts'), "import '@aurum/other/internal';\n");
    result = run(); assert.notEqual(result.status, 0); assert.match(result.stderr, /package internal/);
    fs.writeFileSync(path.join(src, 'b.ts'), 'export const value = 1;\n');
    result = run(); assert.equal(result.status, 0);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
