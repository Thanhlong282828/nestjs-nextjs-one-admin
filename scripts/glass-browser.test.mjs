// Local-only browser integration smoke test. Start both Next dev servers and Chrome
// with --remote-debugging-port=9229 before running; this does not seed data.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const adminPort = Number(process.env.AURUM_ADMIN_PORT ?? 3000);
const productPort = Number(process.env.AURUM_PRODUCT_PORT ?? 3001);
if (![adminPort, productPort].every(port => Number.isInteger(port) && port > 0 && port < 65536)) throw new Error('Invalid localhost port');
const axe = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const target = await (await fetch('http://127.0.0.1:9229/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const [resolve, reject] = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, [resolve, reject]);
  socket.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function key(key, code, modifiers = 0) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers, windowsVirtualKeyCode: ({ Tab: 9, Escape: 27, Enter: 13, ' ': 32 })[key] ?? 0 });
  if (key === 'Enter' || key === ' ') await send('Input.dispatchKeyEvent', { type: 'char', text: key === 'Enter' ? '\r' : ' ', key, code, modifiers });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers, windowsVirtualKeyCode: ({ Tab: 9, Escape: 27, Enter: 13, ' ': 32 })[key] ?? 0 });
}
try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: `http://localhost:${adminPort}/` });
  await delay(2000);
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Tìm nhanh\"]') !== null"), true, 'admin did not load');
  await evaluate("document.activeElement?.blur(); document.querySelector('[aria-label=\"Tìm nhanh\"]').click()");
  await delay(200);
  assert.equal(await evaluate("document.querySelector('dialog')?.open"), true, 'dialog did not open');
  assert.equal(await evaluate("document.querySelector('dialog')?.contains(document.activeElement)"), true, 'initial focus outside dialog');
  for (let i = 0; i < 9; i++) {
    await key('Tab', 'Tab');
    assert.equal(await evaluate("document.querySelector('dialog')?.contains(document.activeElement)"), true, `Tab focus escaped on step ${i}`);
  }
  for (let i = 0; i < 9; i++) {
    await key('Tab', 'Tab', 8);
    assert.equal(await evaluate("document.querySelector('dialog')?.contains(document.activeElement)"), true, `Shift+Tab focus escaped on step ${i}`);
  }
  await key('Escape', 'Escape'); await delay(150);
  assert.equal(await evaluate("document.querySelector('dialog')?.open"), false, 'Escape did not close dialog');
  assert.equal(await evaluate("document.activeElement?.getAttribute('aria-label')"), 'Tìm nhanh', 'focus was not restored');
  await evaluate("document.querySelector('.glass-popover summary').focus()");
  await key('Enter', 'Enter');
  assert.equal(await evaluate("document.querySelector('.glass-popover')?.open"), true, 'disclosure did not open');
  await evaluate("document.querySelector('.glass-popover summary').focus()"); await key('Escape', 'Escape');
  assert.equal(await evaluate("document.querySelector('.glass-popover')?.open"), false, 'Escape did not close disclosure');
  await key(' ', 'Space');
  assert.equal(await evaluate("document.querySelector('.glass-popover')?.open"), true, 'Space did not open disclosure');
  await key(' ', 'Space');
  assert.equal(await evaluate("document.querySelector('.glass-popover')?.open"), false, 'Space did not close disclosure');
  for (const port of [adminPort, productPort]) {
    await send('Page.navigate', { url: `http://localhost:${port}/` }); await delay(1500);
    await evaluate(axe);
    const violations = await evaluate("axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}).then(result => result.violations.map(v => v.id))");
    assert.deepEqual(violations, [], `axe violations on ${port}: ${violations.join(', ')}`);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'forced-colors', value: 'active' }] });
    assert.equal(await evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(forced-colors: active)').matches"), true);
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.glass-surface')).backdropFilter"), 'none', 'forced colors did not disable blur');
    await send('Emulation.setEmulatedMedia', { features: [] });
  }
  console.log('PASS: dialog Tab/Shift+Tab, Escape, focus restoration, disclosure, axe and forced-colors smoke tests');
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9229/json/close/${target.id}`);
}
