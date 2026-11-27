import { createConnection } from 'mariadb';
import { parseTarget } from './database-report';

export const REQUIRED: Readonly<Record<string, readonly string[]>> = {
  companies: ['SELECT'], branches: ['SELECT'], company_memberships: ['SELECT'], membership_permissions: ['SELECT'], branch_grants: ['SELECT'], identity_users: ['SELECT'], hrm_departments: ['SELECT'], tenant_classification: ['SELECT'], classified_branch_scope: ['SELECT'], identity_sessions: ['SELECT', 'INSERT', 'UPDATE'], hrm_employees: ['SELECT', 'INSERT', 'UPDATE'], hrm_attendance: ['SELECT'], identity_auth_audit: ['SELECT', 'INSERT'], hrm_read_audit: ['SELECT', 'INSERT'], hrm_employee_audit: ['SELECT', 'INSERT'], hrm_security_audit: ['SELECT', 'INSERT'],
};
type Result = { principal: string; database: string; grants: string[]; tables: Record<string, { status: 'accessible' | 'denied' | 'missing'; missingPrivileges: string[] }>; protected: Record<string, string>; risks: string[]; ready: boolean };

/** Only understands explicit grants for this account. Unrecognized role grants fail closed. */
export function grantedPrivileges(grants: readonly string[], db: string, table: string, includeColumnPrivileges = false): Set<string> {
  const result = new Set<string>();
  for (const grant of grants) {
    const match = /^GRANT (.+?) ON (.+?) TO /i.exec(grant);
    if (!match) continue;
    const scope = match[2]?.replaceAll('`', '').toLowerCase();
    if (scope !== '*.*' && scope !== `${db.toLowerCase()}.*` && scope !== `${db.toLowerCase()}.${table.toLowerCase()}`) continue;
    for (const privilege of (match[1] ?? '').toUpperCase().split(/,(?![^()]*\))/).map(x => x.trim())) {
      if (privilege === 'ALL PRIVILEGES' || privilege === 'ALL') ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRIGGER', 'INDEX', 'REFERENCES'].forEach(p => result.add(p));
      else if (!privilege.includes('(') || includeColumnPrivileges) result.add(privilege.replace(/\s*\(.*/, ''));
    }
  }
  return result;
}

export async function checkRuntime(raw: string | undefined): Promise<Result> {
  const target = parseTarget(raw);
  if (process.env.NODE_ENV !== 'development' || target.kind !== 'mysql' || target.url.hostname !== '127.0.0.1' || target.url.port !== '3306' || target.database !== 'aurum_nestjs' || target.url.username !== 'nestjs') throw new Error('Unsupported runtime target or environment');
  const db = await createConnection({ host: target.url.hostname, port: 3306, user: target.url.username, password: decodeURIComponent(target.url.password), database: target.database, connectTimeout: 5000 });
  try {
    const identity = await db.query<Array<{ db: string; principal: string }>>('SELECT DATABASE() AS db, CURRENT_USER() AS principal');
    if (identity[0]?.db !== target.database || identity[0]?.principal !== 'nestjs@localhost') throw new Error('Runtime identity mismatch');
    const rawGrants = await db.query<Array<Record<string, string>>>('SHOW GRANTS FOR CURRENT_USER');
    const grants = rawGrants.map(row => Object.values(row)[0]).filter((x): x is string => typeof x === 'string');
    const tables: Result['tables'] = {};
    for (const [name, needed] of Object.entries(REQUIRED)) {
      let status: 'accessible' | 'denied' | 'missing' = 'accessible';
      try { await db.query(`SELECT 1 FROM \`${name}\` LIMIT 0`); }
      catch (error: unknown) {
        const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        if (code === 'ER_NO_SUCH_TABLE') status = 'missing';
        else if (code === 'ER_TABLEACCESS_DENIED_ERROR' || code === 'ER_DBACCESS_DENIED_ERROR') status = 'denied';
        else throw error;
      }
      const actual = grantedPrivileges(grants, target.database, name);
      tables[name] = { status, missingPrivileges: needed.filter(p => !actual.has(p)) };
    }
    const protectedTables = ['tenant_classification', 'classified_branch_scope'];
    const protectedChecks: Record<string, string> = {};
    for (const name of protectedTables) {
      for (const action of (name === 'tenant_classification' ? ['UPDATE classification', 'UPDATE provenance', 'UPDATE source_reference', 'UPDATE created_at', 'DELETE'] : ['UPDATE classification', 'DELETE'])) {
        const column = action.startsWith('UPDATE ') ? action.slice(7) : '';
        const sql = column ? `EXPLAIN UPDATE \`${name}\` SET \`${column}\`=\`${column}\` WHERE 1=0` : `EXPLAIN DELETE FROM \`${name}\` WHERE 1=0`;
        try { await db.query(sql); protectedChecks[`${name}.${action}`] = 'allowed'; }
        catch (error: unknown) {
          const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
          protectedChecks[`${name}.${action}`] = code === 'ER_NO_SUCH_TABLE' ? 'missing' : code === 'ER_TABLEACCESS_DENIED_ERROR' || code === 'ER_COLUMNACCESS_DENIED_ERROR' ? 'denied' : 'unverified';
        }
      }
    }
    const risks: string[] = [];
    if (grants.some(g => !/^GRANT .+ ON .+ TO /i.test(g))) risks.push('Role or unrecognized grant requires manual review');
    if (grants.some(g => / ON [^ ]*[%\\]/i.test(g))) risks.push('Wildcard database grant requires manual review');
    if (grants.some(g => /WITH GRANT OPTION/i.test(g))) risks.push('Runtime has GRANT OPTION');
    for (const permission of ['INSERT', 'UPDATE', 'DELETE']) if (grantedPrivileges(grants, target.database, 'companies', true).has(permission)) risks.push(`Runtime can ${permission} companies`);
    if (Object.keys(REQUIRED).some(t => ['CREATE', 'DROP', 'ALTER', 'TRIGGER', 'INDEX', 'REFERENCES'].some(p => grantedPrivileges(grants, target.database, t, true).has(p)))) risks.push('Runtime has DDL privileges');
    const ready = risks.length === 0 && Object.values(tables).every(t => t.status === 'accessible' && t.missingPrivileges.length === 0) && Object.values(protectedChecks).every(v => v === 'denied') && protectedTables.every(t => ['INSERT', 'UPDATE', 'DELETE'].every(p => !grantedPrivileges(grants, target.database, t, true).has(p)));
    return { principal: identity[0].principal, database: target.database, grants, tables, protected: protectedChecks, risks, ready };
  } finally { await db.end(); }
}
