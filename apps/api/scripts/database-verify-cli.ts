import { verifyConfiguredDatabase } from './database-verify';
verifyConfiguredDatabase(process.env.DATABASE_URL).then(result => {
  console.log(JSON.stringify(result, null, 2));
  if (result.relationships.some(check => check.status === 'violations')) process.exitCode = 1;
  else if (result.relationships.some(check => check.status !== 'verified')) process.exitCode = 2;
}).catch(() => { console.error('Database verification failed; check connection, schema and read permissions. No credentials were logged.'); process.exitCode = 1; });
