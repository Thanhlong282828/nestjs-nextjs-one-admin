import test from 'node:test';
import assert from 'node:assert/strict';
import { findUnusedStorefrontKeys, validateCatalogSource } from './check-i18n.mjs';
test('detects missing, duplicate, empty and inconsistent placeholders', () => {
  const errors = validateCatalogSource("const vi={hello:'Hi {name}',dup:'a',dup:'b',empty:' '}; const en={hello:'Hello {other}',extra:'x'};", 'fixture.ts');
  for (const term of ['duplicate', 'empty', 'placeholder mismatch', 'missing en.dup', 'missing vi.extra']) assert.ok(errors.some(error => error.includes(term)), term);
  assert.ok(validateCatalogSource("const vi={a:'{bad-name}'}; const en={a:'x'};", 'fixture.ts').some(error => error.includes('invalid placeholder')));
  assert.ok(validateCatalogSource('const vi={a:"x"};', 'fixture.ts').some(error => error.includes('missing vi or en')));
});
test('finds storefront keys with no direct usage', () => {
  assert.deepEqual(findUnusedStorefrontKeys("const vi={used:'x',unused:'y'} as const;", 'const value = t.used;'), ['unused']);
});
