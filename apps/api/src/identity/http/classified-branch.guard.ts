import { ForbiddenException, Inject, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { authorizeClassifiedBranch, authorizeCompany, type Principal } from '@aurum/access';
import type { AuthenticatedSession } from './session.guard';
import { BRANCH_READER, PRINCIPAL_READER, type BranchReader, type PrincipalReader } from './branch-scope.guard';

export const CLASSIFICATION_READER = Symbol('CLASSIFICATION_READER');
export const SERVER_DATA_TRACK = Symbol('SERVER_DATA_TRACK');
export interface ClassificationReader {
  findByCompanyAndBranch(companyId: string, branchId: string): Promise<Readonly<{ companyId: string; classification: unknown; provenance: unknown; sourceReference: unknown }> | null>;
}
type Request = { auth?: AuthenticatedSession; params: Record<string, unknown>; hrmScope?: Readonly<{ companyId: string; branchId: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Candidate guard; track is injected server configuration, never a browser-supplied claim. */
@Injectable()
export class ClassifiedEmployeeReadGuard implements CanActivate {
  constructor(
    @Inject(PRINCIPAL_READER) private readonly principals: PrincipalReader,
    @Inject(BRANCH_READER) private readonly branches: BranchReader,
    @Inject(CLASSIFICATION_READER) private readonly classifications: ClassificationReader,
    @Inject(SERVER_DATA_TRACK) private readonly serverTrack: unknown,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    delete request.hrmScope;
    if (!request.auth) throw new UnauthorizedException();
    const { companyId, branchId } = request.params;
    if (typeof companyId !== 'string' || !uuid.test(companyId) || typeof branchId !== 'string' || !uuid.test(branchId)) throw new ForbiddenException();
    const principal: Principal | null = await this.principals.findByUserId(request.auth.userId);
    const branch = await this.branches.findByCompanyAndId(companyId, branchId);
    const record = await this.classifications.findByCompanyAndBranch(companyId, branchId);
    if (!principal || principal.userId !== request.auth.userId || !branch || branch.id !== branchId || !authorizeClassifiedBranch(principal, companyId, branch, 'employee.read', this.serverTrack, record).allowed) throw new ForbiddenException();
    const trackPermission = this.serverTrack === 'REAL' ? 'tenant.real.read' : 'tenant.demo.read';
    if (!authorizeCompany(principal, companyId, trackPermission).allowed) throw new ForbiddenException();
    request.hrmScope = { companyId, branchId };
    return true;
  }
}
