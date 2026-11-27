import { report } from './database-report';

report(process.env.DATABASE_URL).then(result => {
  console.log(JSON.stringify({ ...result, note: 'Classification counts are not proof of verified REAL provenance. Other modules are not yet reported.' }, null, 2));
}).catch(() => {
  console.error('Database report failed. Check target, connectivity, schema and read permissions; no credentials were logged.');
  process.exitCode = 1;
});
