import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
try {
  for (const [port, heading, title] of [[3190, /command center/i, 'Aurum | Operations workspace'], [3101, /The collection is being prepared/, 'Aurum Shop | Thoughtful shopping']]) {
    const context = await browser.newContext({ javaScriptEnabled: false });
    try {
      await context.addCookies([{ name: 'aurum-locale', value: 'en', url: `http://127.0.0.1:${port}` }]);
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/`);
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      await page.getByRole('heading', { name: heading }).waitFor();
      assert.equal(await page.title(), title);
      await context.clearCookies();
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    } finally { await context.close(); }
  }
  for (const port of [3190, 3101]) {
    const context = await browser.newContext();
    try {
      await context.addCookies([{ name: 'aurum-locale', value: 'en', url: `http://127.0.0.1:${port}` }]);
      await context.addInitScript(() => localStorage.setItem('aurum-locale', 'vi'));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && /hydrat/i.test(message.text())) errors.push(message.text()); });
      await page.goto(`http://127.0.0.1:${port}/?check=1#top`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(await page.evaluate(() => localStorage.getItem('aurum-locale')), 'en');
      assert.deepEqual(errors, []);
      await page.getByLabel('Language').selectOption('vi');
      assert.equal(new URL(page.url()).search, '?check=1');
      assert.equal(new URL(page.url()).hash, '#top');
      assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
      assert.match(await page.title(), /Không gian vận hành|Mua sắm tinh tế/);
      const cookie = (await context.cookies()).find(item => item.name === 'aurum-locale');
      assert.equal(cookie?.value, 'vi');
      assert.equal(cookie?.sameSite, 'Lax');
    } finally { await context.close(); }
  }
  console.log('PASS: SSR locale, metadata, cookie precedence, URL and hydration smoke for both apps');
} finally { await browser.close(); }
