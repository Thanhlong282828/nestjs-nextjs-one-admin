/** Server-loaded authorization snapshot. Never construct this from request body or client claims. */
export type Membership = Readonly<{
  companyId: string;
  status: 'active' | 'suspended';
  permissions: readonly string[];
  /** null means all branches in this company; an empty array means no branches. */
  branchIds: readonly string[] | null;
}>;
export type Principal = Readonly<{
  userId: string;
  status: 'active' | 'disabled';
  memberships: readonly Membership[];
}>;
export type Decision = Readonly<{ allowed: boolean; reason: 'allowed' | 'unauthenticated' | 'inactive' | 'forbidden' }>;
const denied = (reason: Decision['reason']): Decision => ({ allowed: false, reason });
const identifier = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Explicit permission and exact tenant match; system admins have no implicit bypass. */
export function authorizeCompany(principal: Principal | null, companyId: string, permission: string): Decision {
  if (!principal) return denied('unauthenticated');
  if (principal.status !== 'active') return denied('inactive');
  if (!identifier.test(principal.userId) || !identifier.test(companyId) || !permission.trim()) return denied('forbidden');
  // Duplicate active memberships are ambiguous; fail closed until resolved by the identity store.
  const matches = principal.memberships.filter(m => m.companyId === companyId && m.status === 'active');
  if (matches.length !== 1 || !matches[0]?.permissions.includes(permission)) return denied('forbidden');
  return { allowed: true, reason: 'allowed' };
}

/** branch must come from a server-side lookup scoped to the requested company. */
export function authorizeBranch(principal: Principal | null, companyId: string, branch: Readonly<{ id: string; companyId: string }>, permission: string): Decision {
  const company = authorizeCompany(principal, companyId, permission);
  if (!company.allowed || !principal || !identifier.test(branch.id) || branch.companyId !== companyId) return denied(company.allowed ? 'forbidden' : company.reason);
  const membership = principal.memberships.find(m => m.companyId === companyId && m.status === 'active');
  if (!membership || (membership.branchIds !== null && !membership.branchIds.includes(branch.id))) return denied('forbidden');
  return { allowed: true, reason: 'allowed' };
}
