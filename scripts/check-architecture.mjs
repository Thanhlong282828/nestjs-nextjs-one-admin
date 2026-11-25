import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const roots = [...fs.readdirSync('packages').map(name => `packages/${name}/src`), 'apps/api/src'];
const sources = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'generated') walk(path.join(dir, entry.name));
    else if (entry.isFile() && /\.tsx?$/.test(entry.name)) sources.push(path.resolve(dir, entry.name));
  }
}
for (const root of roots) walk(root);
const sourceSet = new Set(sources), graph = new Map(sources.map(file => [file, []])), errors = [];
const workspaceOf = file => { const rel = path.relative(process.cwd(), file).split(path.sep); return rel[0] === 'packages' ? `${rel[0]}/${rel[1]}` : rel[0] === 'apps' ? `${rel[0]}/${rel[1]}` : null; };
function resolveRelative(file, specifier) {
  const base = path.resolve(path.dirname(file), specifier);
  return [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')].find(candidate => sourceSet.has(candidate));
}
for (const file of sources) {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) continue;
    if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const specifier = node.moduleSpecifier.text;
    if (/^@aurum\/[^/]+\//.test(specifier)) errors.push(`${path.relative(process.cwd(), file)} imports a package internal: ${specifier}`);
    if (!specifier.startsWith('.')) continue;
    const target = resolveRelative(file, specifier);
    if (!target) continue;
    if (workspaceOf(file) !== workspaceOf(target)) errors.push(`${path.relative(process.cwd(), file)} crosses workspace boundary: ${specifier}`);
    const typeOnly = ts.isImportDeclaration(node) ? node.importClause?.isTypeOnly : node.isTypeOnly;
    if (!typeOnly) graph.get(file).push(target);
  }
}
const state = new Map(), stack = [];
function visit(file) {
  if (state.get(file) === 2) return;
  if (state.get(file) === 1) { const start = stack.indexOf(file); errors.push(`Runtime import cycle: ${[...stack.slice(start), file].map(item => path.relative(process.cwd(), item)).join(' -> ')}`); return; }
  state.set(file, 1); stack.push(file);
  for (const target of graph.get(file)) visit(target);
  stack.pop(); state.set(file, 2);
}
for (const file of sources) visit(file);
if (errors.length) { for (const error of errors) console.error(error); process.exitCode = 1; }
else console.log(`Architecture check passed: ${sources.length} backend/library source files; no relative workspace crossings, deep @aurum imports or static runtime import cycles.`);
