import { ForbiddenException, Inject, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { authorizeBranch, type Principal } from '@aurum/access';
import type { AuthenticatedSession } from './session.guard';

export const PRINCIPAL_READER = Symbol('PRINCIPAL_READER');
export const BRANCH_READER = Symbol('BRANCH_READER');
export interface PrincipalReader { findByUserId(userId: string): Promise<Principal | null> }
export interface BranchReader { findByCompanyAndId(companyId: string, branchId: string): Promise<Readonly<{ id: string; companyId: string }> | null> }
type Request = { auth?: AuthenticatedSession; params: Record<string, unknown>; hrmScope?: Readonly<{ companyId: string; branchId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Unregistered: requires SessionGuard first and real server-side providers before use. */
@Injectable()
export class HrmReadBranchGuard implements CanActivate {
  protected readonly permission: string = 'employee.read';
  constructor(@Inject(PRINCIPAL_READER) private readonly principals: PrincipalReader, @Inject(BRANCH_READER) private readonly branches: BranchReader) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    delete request.hrmScope;
    if (!request.auth) throw new UnauthorizedException();
    const { companyId, branchId } = request.params;
    if (typeof companyId !== 'string' || !uuid.test(companyId) || typeof branchId !== 'string' || !uuid.test(branchId)) throw new ForbiddenException();
    const principal = await this.principals.findByUserId(request.auth.userId);
    if (!principal || principal.userId !== request.auth.userId) throw new ForbiddenException();
    const branch = await this.branches.findByCompanyAndId(companyId, branchId);
    if (!branch || branch.id !== branchId || !authorizeBranch(principal, companyId, branch, this.permission).allowed) throw new ForbiddenException();
    request.hrmScope = { companyId, branchId };
    return true;
  }
}

/** Separate permissions prevent employee access from implicitly granting attendance access. */
@Injectable()
export class AttendanceReadBranchGuard extends HrmReadBranchGuard {
  protected override readonly permission = 'attendance.read';
}
