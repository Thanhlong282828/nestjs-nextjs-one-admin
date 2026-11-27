import { checkRuntime } from './runtime-permission-check';
checkRuntime(process.env.DATABASE_URL).then(result => { console.log(JSON.stringify(result, null, 2)); if (!result.ready) process.exitCode = 2; }).catch(() => { console.error('Runtime verification failed; check target, connectivity and grants.'); process.exitCode = 1; });
