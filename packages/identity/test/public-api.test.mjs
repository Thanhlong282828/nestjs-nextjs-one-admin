import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as identity from '../dist/index.js';

test('identity exports application command and query handlers through its public API', () => {
  for (const name of ['LoginCommand', 'LoginCommandHandler', 'LogoutCommand', 'LogoutCommandHandler', 'LogoutAllCommand', 'LogoutAllCommandHandler', 'RevokeSessionCommand', 'RevokeSessionCommandHandler', 'GetCurrentUserQuery', 'GetCurrentUserQueryHandler', 'GetUserSessionsQuery', 'GetUserSessionsQueryHandler']) {
    assert.equal(typeof identity[name], 'function', `${name} must be exported`);
  }
});
