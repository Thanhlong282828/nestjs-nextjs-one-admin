import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogs, isLocale, resolveLocale, translate, formatCurrency, formatDateTime, formatPercent, type TranslationKey, type Locale } from '../dist/index';
import { storefrontCatalog } from '../dist/storefront';
import { adminCatalog } from '../dist/admin';

test('locale selection uses trusted user then company, branch, saved and default', () => {
  assert.equal(resolveLocale({ user: 'en', branch: 'vi' }), 'en');
  assert.equal(resolveLocale({ user: 'xx', branch: 'en', company: 'vi' }), 'vi');
  assert.equal(resolveLocale({ branch: 'en' }), 'en');
  assert.equal(resolveLocale({ company: 'en', saved: 'vi' }), 'en');
  assert.equal(resolveLocale({ saved: 'en' }), 'en');
  assert.equal(resolveLocale({ saved: 'fr' }), 'vi');
  assert.equal(isLocale('__proto__'), false);
});
test('catalogs have matching keys and translation works', () => {
  assert.deepEqual(Object.keys(catalogs.en).sort(), Object.keys(catalogs.vi).sort());
  for (const key of Object.keys(catalogs.vi) as TranslationKey[]) assert.ok(catalogs.en[key].trim() && catalogs.vi[key].trim());
  assert.equal(translate('en', 'common.language'), 'Language');
});
test('formatting respects currency and explicit timezone without changing values', () => {
  assert.match(formatCurrency(1500000n, 'VND', 'vi'), /1[.\s]500[.\s]000/);
  assert.equal(formatPercent(0.25, 'en'), '25%');
  assert.equal(formatDateTime(new Date('2025-01-01T00:30:00Z'), 'en', 'America/Los_Angeles', { year: 'numeric', month: '2-digit', day: '2-digit' }), '12/31/2024');
  assert.throws(() => formatDateTime(new Date(), 'en', 'Not/AZone'), RangeError);
});
test('storefront catalogs contain the same nonempty keys in both locales', () => {
  assert.deepEqual(Object.keys(storefrontCatalog.vi).sort(), Object.keys(storefrontCatalog.en).sort());
  for (const locale of ['vi', 'en'] satisfies Locale[]) for (const value of Object.values(storefrontCatalog[locale])) assert.ok(value.trim());
});
test('admin catalogs contain the same nonempty keys in both locales', () => {
  assert.deepEqual(Object.keys(adminCatalog.vi).sort(), Object.keys(adminCatalog.en).sort());
  for (const locale of ['vi', 'en'] satisfies Locale[]) for (const value of Object.values(adminCatalog[locale])) assert.ok(value.trim());
});
