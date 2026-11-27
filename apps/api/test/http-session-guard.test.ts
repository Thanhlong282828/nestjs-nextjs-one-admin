import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { SessionGuard } from '../src/identity/http/session.guard';

type Request = { headers: { cookie?: string | string[] }; auth?: { userId: string; sessionId: string } };
function context(request: Request): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}
test('session guard uses only a valid single cookie and derives identity server-side', async () => {
  const token = 'a'.repeat(43);
  let calls = 0;
  const guard = new SessionGuard({ async authenticate(value) { calls++; return value === token ? { userId: 'server-user', sessionId: 'server-session' } : null; } });
  const request: Request = { headers: { cookie: `other=1; aurum_session=${token}` }, auth: { userId: 'untrusted', sessionId: 'untrusted' } };
  assert.equal(await guard.canActivate(context(request)), true);
  assert.deepEqual(request.auth, { userId: 'server-user', sessionId: 'server-session' });
  for (const cookie of [undefined, 'aurum_session=bad', `aurum_session=${token}; aurum_session=${token}`, ['aurum_session=x'], `aurum_session=${'x'.repeat(4097)}`]) {
    const invalid: Request = { headers: cookie === undefined ? {} : { cookie }, auth: { userId: 'untrusted', sessionId: 'untrusted' } };
    await assert.rejects(guard.canActivate(context(invalid)), UnauthorizedException);
    assert.equal(invalid.auth, undefined);
  }
  assert.equal(calls, 1);
  const expired: Request = { headers: { cookie: `aurum_session=${'b'.repeat(43)}` } };
  await assert.rejects(guard.canActivate(context(expired)), UnauthorizedException);
  assert.equal(expired.auth, undefined);
});
