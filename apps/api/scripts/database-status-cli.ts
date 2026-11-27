import { report } from './database-report';
report(process.env.DATABASE_URL).then(result => {
  console.log(JSON.stringify({ ...result, note: 'Read-only status; migration history and other modules are not checked.' }, null, 2));
}).catch(() => { console.error('Database status failed; check target, connectivity and read permissions. No credentials were logged.'); process.exitCode = 1; });
