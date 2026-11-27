import { readFileSync } from 'node:fs';
import ts from 'typescript';

/** Static catalog validation: duplicate/missing/empty keys and placeholder parity. */
export function validateCatalogSource(source, fileName) {
  const tree = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const errors = tree.parseDiagnostics.map(d => `${fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  const catalogs = new Map();
  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && ['vi', 'en'].includes(node.name.text)) {
      let value = node.initializer;
      if (value && ts.isAsExpression(value)) value = value.expression;
      if (!value || !ts.isObjectLiteralExpression(value)) return;
      const entries = new Map();
      for (const property of value.properties) {
        if (!ts.isPropertyAssignment(property) || !property.name || !(ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) || !ts.isStringLiteral(property.initializer)) {
          errors.push(`${fileName}: unsupported catalog entry`); continue;
        }
        const key = property.name.text, text = property.initializer.text;
        if (entries.has(key)) errors.push(`${fileName}: duplicate ${node.name.text}.${key}`);
        if (!text.trim()) errors.push(`${fileName}: empty ${node.name.text}.${key}`);
        const placeholders = [...text.matchAll(/\{([^{}]+)\}/g)].map(match => match[1]).sort();
        if (placeholders.some(name => !/^[A-Za-z][\w]*$/.test(name ?? '')) || text.replace(/\{[A-Za-z][\w]*\}/g, '').match(/[{}]/)) errors.push(`${fileName}: invalid placeholder ${node.name.text}.${key}`);
        entries.set(key, placeholders.join(','));
      }
      catalogs.set(node.name.text, entries);
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  const vi = catalogs.get('vi'), en = catalogs.get('en');
  if (!vi || !en) return [...errors, `${fileName}: missing vi or en catalog`];
  for (const [key, placeholders] of vi) {
    if (!en.has(key)) errors.push(`${fileName}: missing en.${key}`);
    else if (en.get(key) !== placeholders) errors.push(`${fileName}: placeholder mismatch ${key}`);
  }
  for (const key of en.keys()) if (!vi.has(key)) errors.push(`${fileName}: missing vi.${key}`);
  return errors;
}
/** Detect unused storefront keys based on direct t.key access in its page. */
export function findUnusedStorefrontKeys(catalogSource, pageSource) {
  const catalog = ts.createSourceFile('catalog.ts', catalogSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const page = ts.createSourceFile('page.tsx', pageSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const keys = new Set(), used = new Set();
  function visitCatalog(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'vi') {
      const value = node.initializer && ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (value && ts.isObjectLiteralExpression(value)) for (const property of value.properties) {
        if (ts.isPropertyAssignment(property) && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) keys.add(property.name.text);
      }
    }
    ts.forEachChild(node, visitCatalog);
  }
  function visitPage(node) {
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') used.add(node.name.text);
    ts.forEachChild(node, visitPage);
  }
  visitCatalog(catalog); visitPage(page);
  return [...keys].filter(key => !used.has(key));
}
if (process.argv[1]?.endsWith('check-i18n.mjs')) {
  const files = ['packages/i18n/src/index.ts', 'packages/i18n/src/storefront.ts', 'packages/i18n/src/admin.ts'];
  const errors = files.flatMap(file => { try { return validateCatalogSource(readFileSync(file, 'utf8'), file); } catch { return [`${file}: missing locale file`]; } });
  try {
    const unused = findUnusedStorefrontKeys(readFileSync(files[1], 'utf8'), readFileSync('apps/khach/app/page.tsx', 'utf8'));
    errors.push(...unused.map(key => `storefront: unused ${key}`));
  } catch { errors.push('storefront: unable to inspect key usage'); }
  try {
    const usage = ['apps/admin/app/page.tsx', 'apps/admin/app/components/hrm.tsx', 'apps/admin/app/components/hrm-live.tsx', 'packages/ui-glass/components.tsx'].map(file => readFileSync(file, 'utf8')).join('\n');
    const unused = findUnusedStorefrontKeys(readFileSync(files[2], 'utf8'), usage);
    errors.push(...unused.map(key => `admin: unused ${key}`));
  } catch { errors.push('admin: unable to inspect key usage'); }
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
  else console.log('i18n catalog validation passed');
}
