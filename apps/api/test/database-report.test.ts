import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTarget } from '../scripts/database-report';

test('database report selects configured MySQL or PostgreSQL target without a hardcoded database name', () => {
  const mysql = parseTarget('mysql://reader:secret@127.0.0.1:3307/example_db');
  assert.equal(mysql.kind, 'mysql'); assert.equal(mysql.database, 'example_db');
  const pg = parseTarget('postgresql://reader:secret@localhost:5433/other_db');
  assert.equal(pg.kind, 'postgresql'); assert.equal(pg.database, 'other_db');
});
test('database report rejects missing targets and unsupported or unsafe MySQL options', () => {
  for (const value of [undefined, '', 'not a url', 'sqlite://reader@localhost/a', 'mysql://reader@localhost/', 'mysql://reader@localhost/a?ssl=false', 'mysql://reader@localhost/a#fragment']) assert.throws(() => parseTarget(value));
});
