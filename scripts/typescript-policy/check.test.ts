import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkTypeScriptPolicy } from './check';

test('rejects application JavaScript while respecting exact legacy tooling and generated exceptions', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'aurum-ts-policy-'));
  const put = (file: string) => { const target = path.join(root, file); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, ''); };
  try {
    mkdirSync(path.join(root, 'apps')); mkdirSync(path.join(root, 'packages'));
    put('apps/api/src/company/service.js');
    put('apps/api/src/generated/prisma/client.js');
    put('apps/admin/.next-e2e/dev/server/page.js');
    put('apps/api/scripts/tool.mjs');
    put('packages/hrm/test/legacy.test.mjs');
    put('packages/hrm/src/domain/model.ts');
    const allowed = { 'apps/api/scripts/tool.mjs': 'Existing tooling', 'packages/hrm/test/legacy.test.mjs': 'Legacy test' };
    assert.deepEqual(checkTypeScriptPolicy(root, allowed), ['JavaScript requires an approved tooling/test exception: apps/api/src/company/service.js']);
    assert.ok(checkTypeScriptPolicy(root, { ...allowed, 'apps/api/src/company/service.js': 'Not allowed' }).some(message => message.includes('Invalid JavaScript exception')));
    put('packages/hrm/src/new-feature.mjs');
    assert.ok(checkTypeScriptPolicy(root, allowed).some(message => message.includes('packages/hrm/src/new-feature.mjs')));
    put('apps/api/src/dist/hidden.js');
    assert.ok(checkTypeScriptPolicy(root, allowed).some(message => message.includes('apps/api/src/dist/hidden.js')));
    put('packages/hrm/test/new.test.mjs');
    assert.ok(checkTypeScriptPolicy(root, allowed).some(message => message.includes('packages/hrm/test/new.test.mjs')));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
