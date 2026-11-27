import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type AppliedMigration = Readonly<{ migration_name: string; checksum: string; finished_at: Date | null; rolled_back_at: Date | null }>;
export function loadMigrationRegistry(directory: string): ReadonlyArray<{ name: string; checksum: string }> {
  const names = readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  if (!names.length || names.some(name => !/^\d{12}_[a-z0-9_]+$/.test(name) || name.startsWith('202611270011_'))) throw new Error('Invalid or test-only application migration');
  return names.map(name => ({ name, checksum: createHash('sha256').update(readFileSync(join(directory, name, 'migration.sql'))).digest('hex') }));
}
export function verifyMigrationHistory(registry: ReadonlyArray<{ name: string; checksum: string }>, history: readonly AppliedMigration[]): void {
  const completed = history.filter(item => item.finished_at !== null && item.rolled_back_at === null);
  if (history.some(item => item.finished_at === null && item.rolled_back_at === null)) throw new Error('Unresolved failed migration');
  if (completed.length > registry.length) throw new Error('Unexpected applied migration');
  for (let i = 0; i < completed.length; i++) {
    const actual = completed[i]; const expected = registry[i];
    if (!actual || !expected || actual.migration_name !== expected.name || actual.checksum !== expected.checksum) throw new Error('Migration order or checksum drift detected');
  }
}
