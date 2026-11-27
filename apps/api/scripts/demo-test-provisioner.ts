import { createHash } from 'node:crypto';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client';
import { createDemoPlan, type DemoRecord, type ExistingRecord } from '../../../scripts/demo-provisioning/plan';

/** Intentionally limited to newly created isolated test tenants; never adopts existing companies. */
export type TestDemoManifest = Readonly<{
  company: Readonly<{ id: string; name: string }>;
  branch: Readonly<{ id: string; name: string }>;
  department: Readonly<{ id: string; code: string; name: string }>;
  employee: Readonly<{ id: string; code: string; fullName: string }>;
  attendance: Readonly<{ id: string; workDate: string; status: 'present' }>;
}>;
type Kind = 'company' | 'branch' | 'department' | 'employee' | 'attendance';
type Tx = Prisma.TransactionClient;
type Node = Readonly<{ id: string; kind: Kind; dependsOn: readonly string[]; values: readonly string[] }>;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const fingerprint = (values: readonly string[]) => createHash('sha256').update(JSON.stringify(values)).digest('hex');
function nodes(m: TestDemoManifest): readonly Node[] {
  const { company: c, branch: b, department: d, employee: e, attendance: a } = m;
  const ids = [c.id, b.id, d.id, e.id, a.id];
  if (ids.some(id => !idPattern.test(id)) || new Set(ids).size !== ids.length) throw new Error('Invalid manifest identifiers');
  for (const [text, max] of [[c.name, 150], [b.name, 150], [d.code, 32], [d.name, 150], [e.code, 32], [e.fullName, 150]] as const) if (!text || text !== text.trim() || text.length > max || [...text].some(ch => (ch.codePointAt(0) ?? 0) < 32)) throw new Error('Invalid manifest text');
  const date = new Date(`${a.workDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.workDate) || Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== a.workDate || a.status !== 'present') throw new Error('Invalid attendance');
  return [
    { id: c.id, kind: 'company', dependsOn: [], values: [c.id, c.name] },
    { id: b.id, kind: 'branch', dependsOn: [c.id], values: [b.id, c.id, b.name] },
    { id: d.id, kind: 'department', dependsOn: [b.id], values: [d.id, c.id, b.id, d.code, d.name] },
    { id: e.id, kind: 'employee', dependsOn: [d.id], values: [e.id, c.id, b.id, d.id, e.code, e.fullName, 'active'] },
    { id: a.id, kind: 'attendance', dependsOn: [e.id], values: [a.id, c.id, b.id, e.id, a.workDate, a.status] },
  ];
}
async function actual(tx: Tx, node: Node): Promise<readonly string[] | null> {
  switch (node.kind) {
    case 'company': { const r = await tx.company.findUnique({ where: { id: node.id } }); return r && [r.id, r.name]; }
    case 'branch': { const r = await tx.branch.findUnique({ where: { id: node.id } }); return r && [r.id, r.companyId, r.name]; }
    case 'department': { const r = await tx.department.findUnique({ where: { id: node.id } }); return r && [r.id, r.companyId, r.branchId, r.code, r.name]; }
    case 'employee': { const r = await tx.employee.findUnique({ where: { id: node.id } }); return r && [r.id, r.companyId, r.branchId, r.departmentId, r.code, r.fullName, r.status]; }
    case 'attendance': { const r = await tx.attendance.findUnique({ where: { id: node.id } }); return r && [r.id, r.companyId, r.branchId, r.employeeId, r.workDate.toISOString().slice(0, 10), r.status]; }
  }
}
async function create(tx: Tx, m: TestDemoManifest, kind: Kind): Promise<void> {
  const companyId = m.company.id, branchId = m.branch.id;
  switch (kind) {
    case 'company': await tx.company.create({ data: m.company }); break;
    case 'branch': await tx.branch.create({ data: { ...m.branch, companyId } }); break;
    case 'department': await tx.department.create({ data: { ...m.department, companyId, branchId } }); break;
    case 'employee': await tx.employee.create({ data: { ...m.employee, companyId, branchId, departmentId: m.department.id, status: 'active' } }); break;
    case 'attendance': await tx.attendance.create({ data: { ...m.attendance, companyId, branchId, employeeId: m.employee.id, workDate: new Date(`${m.attendance.workDate}T00:00:00.000Z`) } }); break;
  }
}
async function remove(tx: Tx, node: Node): Promise<void> {
  switch (node.kind) {
    case 'company': await tx.company.delete({ where: { id: node.id } }); break;
    case 'branch': await tx.branch.delete({ where: { id: node.id } }); break;
    case 'department': await tx.department.delete({ where: { id: node.id } }); break;
    case 'employee': await tx.employee.delete({ where: { id: node.id } }); break;
    case 'attendance': await tx.attendance.delete({ where: { id: node.id } }); break;
  }
}
/** Opens only an explicitly selected localhost test database; never accepts an injected client. */
export async function provisionTestDemo(url: string, manifest: TestDemoManifest, mode: 'dry-run' | 'apply' | 'rollback', testFault?: 'after-company') {
  const target = new URL(url);
  if (process.env.NODE_ENV !== 'test' || target.protocol !== 'mysql:' || target.hostname !== '127.0.0.1' || !['3306', '3307'].includes(target.port) || target.pathname !== '/aurum_nestjs_test' || target.search || target.hash || !['dry-run', 'apply', 'rollback'].includes(mode)) throw new Error('Refusing non-test target');
  const graph = nodes(manifest);
  const db = new PrismaClient({ adapter: new PrismaMariaDb(url) });
  try {
    const selected = await db.$queryRaw<Array<{ databaseName: string }>>`SELECT DATABASE() AS databaseName`;
    if (selected[0]?.databaseName !== 'aurum_nestjs_test') throw new Error('Test database identity mismatch');
    for (let attempt = 0; attempt < 4; attempt++) {
      try { return await db.$transaction(async tx => {
      const records: DemoRecord[] = graph.map(node => ({ id: node.id, kind: node.kind, companyId: manifest.company.id, marker: 'DEMO', fingerprint: fingerprint(node.values), dependsOn: node.dependsOn }));
      const existing: ExistingRecord[] = [];
      for (const node of graph) {
        const value = await actual(tx, node);
        const owner = await tx.demoOwnership.findUnique({ where: { id: node.id } });
        if ((value === null) !== (owner === null)) throw new Error('Unowned or missing record conflict');
        if (value && owner) {
          const digest = fingerprint(value);
          if (digest !== owner.fingerprint || owner.companyId !== manifest.company.id || owner.kind !== node.kind) throw new Error('Persisted ownership conflict');
          existing.push({ id: node.id, kind: node.kind, companyId: owner.companyId, marker: 'DEMO', fingerprint: digest });
        }
      }
      const plan = createDemoPlan(manifest.company.id, records, existing);
      if (mode === 'rollback' && plan.steps.some(step => step.action !== 'unchanged')) throw new Error('Rollback requires a complete unchanged owned graph');
      if (mode === 'apply') for (const step of plan.steps) if (step.action === 'create') {
        const node = graph.find(item => item.id === step.id);
        if (!node) throw new Error('Invalid plan');
        await create(tx, manifest, node.kind);
        await tx.demoOwnership.create({ data: { id: node.id, companyId: manifest.company.id, kind: node.kind, fingerprint: fingerprint(node.values) } });
        if (testFault === 'after-company' && node.kind === 'company') throw new Error('Injected transaction failure');
        const stored = await actual(tx, node);
        if (!stored || fingerprint(stored) !== fingerprint(node.values)) throw new Error('Post-write verification failed');
      }
      if (mode === 'rollback') for (const node of [...graph].reverse()) {
        await tx.demoOwnership.delete({ where: { id: node.id } });
        await remove(tx, node);
      }
      return { target: 'aurum_nestjs_test', mode, companyId: manifest.company.id, steps: plan.steps };
      }, { isolationLevel: 'Serializable' }); }
      catch (error) {
        if (attempt === 3 || typeof error !== 'object' || error === null || !('code' in error) || error.code !== 'P2034') throw error;
      }
    }
    throw new Error('Transaction retries exhausted');
  } finally { await db.$disconnect(); }
}
