import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRuntime, grantedPrivileges } from '../scripts/runtime-permission-check';

test('effective grants include global and database privileges and do not borrow from another schema', () => {
  const grants = ['GRANT USAGE ON *.* TO `nestjs`@`localhost`', 'GRANT SELECT ON `aurum_nestjs`.`tenant_classification` TO `nestjs`@`localhost`', 'GRANT UPDATE (`provenance`) ON `aurum_nestjs`.`tenant_classification` TO `nestjs`@`localhost`', 'GRANT DELETE ON `other`.`tenant_classification` TO `nestjs`@`localhost`'];
  const actual = grantedPrivileges(grants, 'aurum_nestjs', 'tenant_classification');
  assert.equal(actual.has('SELECT'), true);
  assert.equal(actual.has('UPDATE'), false);
  assert.equal(grantedPrivileges(grants, 'aurum_nestjs', 'tenant_classification', true).has('UPDATE'), true);
  assert.equal(actual.has('DELETE'), false);
  assert.equal(grantedPrivileges(['GRANT ALL PRIVILEGES ON *.* TO `x`@`localhost`'], 'aurum_nestjs', 'tenant_classification').has('DELETE'), true);
});

test('runtime checker rejects unexpected targets before connecting', async () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'development';
    await assert.rejects(checkRuntime('mysql://root:example@127.0.0.1:3306/aurum_nestjs'), /Unsupported runtime/);
    await assert.rejects(checkRuntime('mysql://nestjs:example@127.0.0.1:3308/aurum_nestjs_test'), /Unsupported runtime/);
    process.env.NODE_ENV = 'production';
    await assert.rejects(checkRuntime('mysql://nestjs:example@127.0.0.1:3306/aurum_nestjs'), /Unsupported runtime/);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
