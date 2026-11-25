/** Fail closed before any network connection or database write. */
export function developmentDatabaseUrl(env, { requireSeedConfirmation = true } = {}) {
  if (env.NODE_ENV !== 'development' || (requireSeedConfirmation && env.AURUM_ALLOW_DEVELOPMENT_SEED !== '1')) throw new Error('Expected development environment and explicit seed confirmation when writing');
  let url;
  try { url = new URL(env.DATABASE_URL ?? ''); } catch { throw new Error('Invalid DATABASE_URL'); }
  if (url.protocol !== 'mysql:' || url.hostname !== '127.0.0.1' || url.port !== '3306' || url.pathname !== '/aurum_nestjs' || url.username !== 'nestjs' || !url.password || url.search || url.hash) throw new Error('Refusing unapproved development database');
  return url.toString();
}
