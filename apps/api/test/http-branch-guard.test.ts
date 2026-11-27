import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ForbiddenException, UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { HrmReadBranchGuard } from '../src/identity/http/branch-scope.guard';
import type { Principal } from '@aurum/access';
const companyId = '00000000-0000-4000-8000-000000000001';
const branchId = '00000000-0000-4000-8000-000000000002';
const otherBranch = '00000000-0000-4000-8000-000000000003';
const userId = '00000000-0000-4000-8000-000000000004';
type Request = { auth?: { userId: string; sessionId: string }; params: Record<string, unknown>; hrmScope?: { companyId: string; branchId: string } };
function context(request: Request): ExecutionContext { return { switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext; }
test('branch guard derives permission and branch from server providers and denies cross-scope access', async () => {
  const principal: Principal = { userId, status: 'active', memberships: [{ companyId, status: 'active', permissions: ['employee.read'], branchIds: [branchId] }] };
  const guard = new HrmReadBranchGuard({ async findByUserId(id) { return id === userId ? principal : null; } }, { async findByCompanyAndId(company, branch) { return { id: branch, companyId: company }; } });
  const request: Request = { auth: { userId, sessionId: 'server-session' }, params: { companyId, branchId } };
  assert.equal(await guard.canActivate(context(request)), true);
  assert.deepEqual(request.hrmScope, { companyId, branchId });
  await assert.rejects(guard.canActivate(context({ params: { companyId, branchId } })), UnauthorizedException);
  for (const params of [{ companyId, branchId: otherBranch }, { companyId: otherBranch, branchId }, { companyId: 'bad', branchId }]) {
    const denied: Request = { auth: { userId, sessionId: 'server-session' }, params, hrmScope: { companyId, branchId } };
    await assert.rejects(guard.canActivate(context(denied)), ForbiddenException);
    assert.equal(denied.hrmScope, undefined);
  }
  const mismatch = new HrmReadBranchGuard({ async findByUserId() { return { ...principal, userId: otherBranch }; } }, { async findByCompanyAndId(company, branch) { return { id: branch, companyId: company }; } });
  await assert.rejects(mismatch.canActivate(context({ auth: { userId, sessionId: 'server-session' }, params: { companyId, branchId } })), ForbiddenException);
});
