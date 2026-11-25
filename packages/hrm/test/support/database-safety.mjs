/** Guard the integration suite before it can apply schema changes or delete test rows. */
export function validateTestDatabaseUrl(connectionString, environment = process.env.NODE_ENV) {
  if (environment === 'production') throw new Error('HRM database tests cannot run in production');
  let url;
  try { url = new URL(connectionString); } catch { throw new Error('Invalid HRM test database URL'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Test database must use PostgreSQL');
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Test database host must be loopback');
  if (url.pathname !== '/aurum_test') throw new Error('Test database must be aurum_test');
  if (!url.username || url.search || url.hash) throw new Error('Test database URL must have a user and no query or fragment');
  return connectionString;
}

/** Check the database selected by PostgreSQL, not only the connection string. */
export async function verifyConnectedDatabase(pool) {
  const result = await pool.query('SELECT current_database() AS database, inet_server_addr()::text AS server_address');
  const row = result.rows[0];
  if (row?.database !== 'aurum_test') throw new Error('Connected database is not aurum_test');
  // Container port forwarding can report the container address; URL validation limits the client endpoint to loopback.
}
