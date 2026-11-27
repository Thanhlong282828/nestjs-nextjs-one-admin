import { DEMO_082, stableDemoId } from './connected-demo-provisioner';

type Row = Record<string, unknown>;
type Query = (sql: string, params?: readonly unknown[]) => Promise<readonly Row[]>;
export type DemoPlanInspection = Readonly<{ status: 'new' | 'owned' | 'conflict' | 'unavailable'; reason: string }>;

/** Read-only identity/provenance inspection; never treats a missing privilege as an absent record. */
export async function inspectDemoPlan(query: Query): Promise<DemoPlanInspection> {
  try {
    const rows = await query('SELECT id FROM companies WHERE id = ?', [DEMO_082.companyId]);
    if (rows.length === 0) {
      const entities = [
        { table: 'branches', kind: 'branch', count: 3 },
        { table: 'hrm_departments', kind: 'department', count: 9 },
        { table: 'hrm_employees', kind: 'employee', count: 30 },
        { table: 'hrm_attendance', kind: 'attendance', count: 300 },
        { table: 'hrm_employee_audit', kind: 'audit', count: 1 },
      ] as const;
      for (const entity of entities) {
        const ids = Array.from({ length: entity.count }, (_, i) => stableDemoId(entity.kind, i));
        const collisions = await query(`SELECT id FROM \`${entity.table}\` WHERE id IN (${ids.map(() => '?').join(',')}) LIMIT 1`, ids);
        if (collisions.length) return { status: 'conflict', reason: `A deterministic ${entity.kind} ID already exists.` };
      }
      const identity = await query('SELECT id FROM identity_users WHERE id = ? OR email = ? LIMIT 1', [DEMO_082.userId, DEMO_082.email]);
      if (identity.length) return { status: 'conflict', reason: 'The DEMO login identity or email is already in use.' };
      return { status: 'new', reason: 'Company, child IDs and login email are unused; backup, permissions and transaction safety still require separate verification.' };
    }
    const classification = await query('SELECT classification, provenance FROM tenant_classification WHERE company_id = ?', [DEMO_082.companyId]);
    if (classification.length !== 1 || classification[0]?.classification !== 'DEMO' || classification[0]?.provenance !== DEMO_082.provenance) return { status: 'conflict', reason: 'Existing company has missing or different DEMO provenance.' };
    return { status: 'owned', reason: 'Company provenance matches; child ownership and integrity are not yet verified.' };
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
    if (code === 'ER_TABLEACCESS_DENIED_ERROR' || code === 'ER_COLUMNACCESS_DENIED_ERROR' || code === 'ER_DBACCESS_DENIED_ERROR' || code === 'ER_NO_SUCH_TABLE') return { status: 'unavailable', reason: 'Required table or read privilege is unavailable; no absence was inferred.' };
    throw error;
  }
}
