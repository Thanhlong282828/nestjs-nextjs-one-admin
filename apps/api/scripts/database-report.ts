import { createConnection, type Connection } from 'mariadb';
import { Client } from 'pg';

type DatabaseKind = 'mysql' | 'postgresql';
export function parseTarget(raw: string | undefined): Readonly<{ kind: DatabaseKind; url: URL; database: string }> {
  if (!raw) throw new Error('DATABASE_URL is required');
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('Invalid DATABASE_URL'); }
  const kind = url.protocol === 'mysql:' ? 'mysql' : url.protocol === 'postgres:' || url.protocol === 'postgresql:' ? 'postgresql' : null;
  if (!kind || !url.hostname || !url.username || !url.pathname.slice(1) || url.hash) throw new Error('Unsupported or incomplete database target');
  if (kind === 'mysql' && url.search) throw new Error('MySQL connection options are not supported by this report');
  const database = decodeURIComponent(url.pathname.slice(1));
  if (database.includes('/') || database.includes('\0')) throw new Error('Invalid configured database name');
  return { kind, url, database };
}

type Summary = Readonly<{ engine: DatabaseKind; database: string; schema?: string; companies: Readonly<{ REAL: string; DEMO: string; UNKNOWN: string }> | 'unavailable'; classification: 'present' | 'missing' | 'unavailable' }>;
export async function report(raw: string | undefined): Promise<Summary> {
  const target = parseTarget(raw);
  if (target.kind === 'mysql') {
    let connection: Connection | undefined;
    try {
      connection = await createConnection({ host: target.url.hostname, port: target.url.port ? Number(target.url.port) : 3306, user: decodeURIComponent(target.url.username), password: decodeURIComponent(target.url.password), database: target.database, connectTimeout: 5000 });
      const identity = await connection.query<Array<{ db: string }>>('SELECT DATABASE() AS db');
      if (identity[0]?.db !== target.database) throw new Error('Connected database does not match DATABASE_URL');
      const tables = await connection.query<Array<{ name: string }>>("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('companies', 'tenant_classification')");
      const names = new Set(tables.map(row => row.name));
      if (!names.has('companies')) return { engine: target.kind, database: target.database, companies: 'unavailable', classification: names.has('tenant_classification') ? 'present' : 'missing' };
      if (!names.has('tenant_classification')) {
        // information_schema hides tables from restricted principals: probe to distinguish
        // an absent table from one which exists but is not accessible to this account.
        try {
          await connection.query('SELECT 1 FROM tenant_classification LIMIT 0');
          throw new Error('Classification visibility is inconsistent');
        } catch (error: unknown) {
          const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
          if (code === 'ER_TABLEACCESS_DENIED_ERROR' || code === 'ER_DBACCESS_DENIED_ERROR') return { engine: target.kind, database: target.database, companies: 'unavailable', classification: 'unavailable' };
          if (code !== 'ER_NO_SUCH_TABLE') throw error;
        }
        const rows = await connection.query<Array<{ n: bigint }>>('SELECT COUNT(*) AS n FROM companies');
        return { engine: target.kind, database: target.database, companies: { REAL: '0', DEMO: '0', UNKNOWN: String(rows[0]?.n ?? 0) }, classification: 'missing' };
      }
      const rows = await connection.query<Array<{ track: string; n: bigint }>>("SELECT CASE WHEN BINARY t.classification IN (BINARY 'REAL', BINARY 'DEMO') AND TRIM(t.provenance) <> '' AND (BINARY t.classification <> BINARY 'REAL' OR TRIM(COALESCE(t.source_reference, '')) <> '') THEN t.classification ELSE 'UNKNOWN' END AS track, COUNT(*) AS n FROM companies c LEFT JOIN tenant_classification t ON t.company_id = c.id GROUP BY track");
      const counts = { REAL: '0', DEMO: '0', UNKNOWN: '0' }; for (const row of rows) if (row.track === 'REAL' || row.track === 'DEMO' || row.track === 'UNKNOWN') counts[row.track] = String(row.n); else throw new Error('Ambiguous classification');
      return { engine: target.kind, database: target.database, companies: counts, classification: 'present' };
    } finally { await connection?.end(); }
  }
  const client = new Client({ connectionString: target.url.toString(), connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const identity = await client.query<{ db: string; schema: string }>('SELECT current_database() AS db, current_schema() AS schema');
    const schema = identity.rows[0]?.schema;
    if (identity.rows[0]?.db !== target.database || !schema) throw new Error('Connected database or schema does not match configuration');
    const tables = await client.query<{ name: string }>("SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('companies', 'tenant_classification')");
    const names = new Set(tables.rows.map(row => row.name));
    if (!names.has('companies')) return { engine: target.kind, database: target.database, schema, companies: 'unavailable', classification: names.has('tenant_classification') ? 'present' : 'missing' };
    if (!names.has('tenant_classification')) {
      const rows = await client.query<{ n: string }>('SELECT COUNT(*) AS n FROM companies');
      return { engine: target.kind, database: target.database, schema, companies: { REAL: '0', DEMO: '0', UNKNOWN: rows.rows[0]?.n ?? '0' }, classification: 'missing' };
    }
    const rows = await client.query<{ track: string; n: string }>("SELECT CASE WHEN t.classification IN ('REAL', 'DEMO') AND trim(t.provenance) <> '' AND (t.classification <> 'REAL' OR trim(coalesce(t.source_reference, '')) <> '') THEN t.classification ELSE 'UNKNOWN' END AS track, COUNT(*) AS n FROM companies c LEFT JOIN tenant_classification t ON t.company_id = c.id GROUP BY 1");
    const counts = { REAL: '0', DEMO: '0', UNKNOWN: '0' }; for (const row of rows.rows) if (row.track === 'REAL' || row.track === 'DEMO' || row.track === 'UNKNOWN') counts[row.track] = row.n; else throw new Error('Ambiguous classification');
    return { engine: target.kind, database: target.database, schema, companies: counts, classification: 'present' };
  } finally { await client.end(); }
}
