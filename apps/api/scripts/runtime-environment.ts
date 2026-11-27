/** The serving process must not inherit migration or test-database credentials. */
export function runtimeEnvironment(source: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  if (source.DATABASE_URL && source.MIGRATION_DATABASE_URL) {
    let runtime: URL;
    let migration: URL;
    try { runtime = new URL(source.DATABASE_URL); migration = new URL(source.MIGRATION_DATABASE_URL); }
    catch { throw new Error('Invalid runtime or migration database configuration'); }
    if (runtime.hostname === migration.hostname && runtime.port === migration.port && runtime.username === migration.username) throw new Error('Runtime and migration database principals must be distinct');
  }
  const result = { ...source };
  for (const key of Object.keys(result)) {
    if (key.includes('MIGRATION') || (key.startsWith('MYSQL_') && key.includes('TEST') && key.includes('URL'))) delete result[key];
  }
  return result;
}
