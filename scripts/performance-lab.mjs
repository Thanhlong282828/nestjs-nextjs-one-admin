// Controlled local lab sample, not Lighthouse or field Core Web Vitals.
// Requires Chrome CDP 127.0.0.1:9229 and production Next servers on 3190/3101.
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
const host = 'http://127.0.0.1:9229';
const target = await (await fetch(`${host}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let seq = 0; const pending = new Map();
socket.onmessage = ({ data }) => { const m = JSON.parse(data); if (!m.id || !pending.has(m.id)) return; const [resolve, reject] = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); };
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++seq; pending.set(id, [resolve, reject]); socket.send(JSON.stringify({ id, method, params })); });
async function evaluate(expression) { const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (response.exceptionDetails) throw Error(response.exceptionDetails.text); return response.result.value; }
try {
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__aurumLab={lcp:null,cls:0};try {new PerformanceObserver(list=>{for(const e of list.getEntries())window.__aurumLab.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__aurumLab.cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch{}` });
  for (const [name,port] of [['admin',3190], ['storefront',3101]]) for (let run=1;run<=3;run++) {
    await send('Page.navigate', {url:`http://127.0.0.1:${port}/`}); await delay(3000);
    const data = await evaluate(`(()=>{const n=performance.getEntriesByType('navigation')[0];const f=performance.getEntriesByName('first-contentful-paint')[0];return {title:document.title,ttfb:n?.responseStart,fcp:f?.startTime??null,lcp:window.__aurumLab?.lcp??null,cls:window.__aurumLab?.cls??null,jsBytes:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin) && new URL(e.name).pathname.endsWith('.js')).reduce((sum,e)=>sum+e.encodedBodySize,0),cssBytes:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin) && new URL(e.name).pathname.endsWith('.css')).reduce((sum,e)=>sum+e.encodedBodySize,0),body:document.body?.innerText.slice(0,80)}})()`);
    assert.ok(data.title && data.ttfb > 0, `page failed: ${name}`);
    assert.ok(data.jsBytes > 0 && data.jsBytes <= 350_000, `${name} local encoded JS exceeds provisional 350 kB budget: ${data.jsBytes}`);
    assert.ok(data.cssBytes > 0 && data.cssBytes <= 100_000, `${name} local encoded CSS exceeds provisional 100 kB budget: ${data.cssBytes}`);
    console.log(JSON.stringify({name,run,...data,inp:null}));
  }
  await send('Page.navigate', {url:'http://127.0.0.1:3190/'}); await delay(2000);
  const before = await evaluate("performance.getEntriesByType('resource').filter(e=>e.name.includes('/_next/static/') && e.name.endsWith('.js')).map(e=>e.name)");
  await evaluate("Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Nhân sự').click()"); await delay(1500);
  const after = await evaluate("({heading:document.querySelector('h1')?.innerText,resources:performance.getEntriesByType('resource').filter(e=>e.name.includes('/_next/static/') && e.name.endsWith('.js')).map(e=>e.name)})");
  assert.ok(after.heading?.includes('Con người'), 'HRM view did not load');
  const additionalChunks = after.resources.filter(url=>!before.includes(url)).length;
  assert.ok(additionalChunks > 0, 'HRM no longer loads a separate JS chunk on navigation');
  console.log(JSON.stringify({name:'hrm-navigation',heading:after.heading,additionalChunks}));
} finally { socket.close(); await fetch(`${host}/json/close/${target.id}`); }
