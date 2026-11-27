/** Pure planning only: no database client, writes, rollback or execution. */
export type DemoRecord = Readonly<{
  id: string;
  kind: string;
  companyId: string;
  marker: 'DEMO';
  fingerprint: string;
  dependsOn: readonly string[];
}>;
export type ExistingRecord = Readonly<Pick<DemoRecord, 'id' | 'kind' | 'companyId' | 'fingerprint'> & { marker: 'DEMO' | 'REAL' | 'UNKNOWN' }>;
export type PlanStep = Readonly<{ id: string; kind: string; action: 'create' | 'unchanged' }>;
export type DemoPlan = Readonly<{ companyId: string; steps: readonly PlanStep[] }>;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const digest = /^[0-9a-f]{64}$/;
const typeName = /^[a-z][a-z0-9_]{0,63}$/;

/** Fails closed for unknown dependencies, duplicate identities, scope mismatch and cycles. */
export function createDemoPlan(companyId: string, records: readonly DemoRecord[], existing: readonly ExistingRecord[]): DemoPlan {
  if (!uuid.test(companyId)) throw new Error('Invalid company scope');
  const nodes = new Map<string, DemoRecord>();
  for (const record of records) {
    if (!uuid.test(record.id) || !typeName.test(record.kind) || record.companyId !== companyId || record.marker !== 'DEMO' || !digest.test(record.fingerprint) || nodes.has(record.id)) throw new Error('Invalid or duplicate DEMO record');
    if (new Set(record.dependsOn).size !== record.dependsOn.length) throw new Error('Duplicate dependency');
    nodes.set(record.id, record);
  }
  const observed = new Map<string, ExistingRecord>();
  for (const record of existing) {
    if (!uuid.test(record.id) || !typeName.test(record.kind) || !uuid.test(record.companyId) || !digest.test(record.fingerprint) || observed.has(record.id)) throw new Error('Invalid or duplicate existing record');
    observed.set(record.id, record);
  }
  const visiting = new Set<string>();
  const completed = new Set<string>();
  const steps: PlanStep[] = [];
  function visit(id: string): void {
    if (completed.has(id)) return;
    if (visiting.has(id)) throw new Error('Dependency cycle');
    const record = nodes.get(id);
    if (!record) throw new Error('Unresolved dependency');
    visiting.add(id);
    for (const dependency of [...record.dependsOn].sort()) visit(dependency);
    visiting.delete(id);
    const current = observed.get(id);
    if (current && (current.kind !== record.kind || current.companyId !== companyId || current.marker !== 'DEMO' || current.fingerprint !== record.fingerprint)) throw new Error('Existing record conflict');
    if (current && record.dependsOn.some(dependency => !observed.has(dependency))) throw new Error('Existing record has unresolved persisted dependency');
    steps.push({ id, kind: record.kind, action: current ? 'unchanged' : 'create' });
    completed.add(id);
  }
  for (const id of [...nodes.keys()].sort()) visit(id);
  return { companyId, steps };
}
