import { authorizeClassifiedBranch, authorizeCompany, type Principal } from '@aurum/access';
import type { Prisma } from '../generated/prisma/client';
import { PrismaClassificationReader } from './prisma-classification.reader';

/** Classification is loaded from persisted branch scope, never from the request. */
export async function hasClassifiedBranchAccess(
  tx: Prisma.TransactionClient,
  principal: Principal,
  companyId: string,
  branch: Readonly<{ id: string; companyId: string }>,
  permission: string,
): Promise<boolean> {
  const record = await new PrismaClassificationReader(tx).findByCompanyAndBranch(companyId, branch.id);
  const track = record?.classification;
  if (track !== 'REAL' && track !== 'DEMO') return false;
  return authorizeClassifiedBranch(principal, companyId, branch, permission, track, record).allowed &&
    authorizeCompany(principal, companyId, track === 'REAL' ? 'tenant.real.read' : 'tenant.demo.read').allowed;
}
