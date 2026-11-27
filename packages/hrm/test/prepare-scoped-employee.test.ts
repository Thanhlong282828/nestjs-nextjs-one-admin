import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { InvalidScopedEmployeeError, PrepareScopedEmployeeCommand, PrepareScopedEmployeeHandler } from '../src/index';

const valid = { companyId: '11111111-1111-4111-8111-111111111111', branchId: '22222222-2222-4222-8222-222222222222', departmentId: '33333333-3333-4333-8333-333333333333', code: ' E-01 ', fullName: ' Nguyễn An ' };
const prepare = (input: Readonly<Record<string, unknown>>) => new PrepareScopedEmployeeHandler().execute(new PrepareScopedEmployeeCommand(input));

test('normalizes only fields supported by the current employee schema', () => {
  assert.deepEqual(prepare(valid), { ...valid, code: 'E-01', fullName: 'Nguyễn An' });
});

test('rejects unsupported fields, malformed scope and invalid names', () => {
  for (const input of [{ ...valid, email: 'a@example.test' }, { ...valid, branchId: 'invalid' }, { ...valid, fullName: '  ' }, { ...valid, code: 'x'.repeat(33) }, { ...valid, fullName: 'A\nB' }]) {
    assert.throws(() => prepare(input), InvalidScopedEmployeeError);
  }
});
