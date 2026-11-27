import { checkTypeScriptPolicy, loadExceptions } from './check';

const root = process.cwd();
const failures = checkTypeScriptPolicy(root, loadExceptions('scripts/typescript-policy/exceptions.json'));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('TypeScript application extension policy passed.');
}
