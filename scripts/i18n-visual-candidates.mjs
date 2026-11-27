/* global document */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory = 'tests/visual/candidates-06104b-en';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  for (const size of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'tablet', width: 768, height: 1024 }, { name: 'mobile', width: 390, height: 844 }]) {
    for (const theme of ['light', 'dark']) {
      for (const [application, port] of [['admin', 3190], ['product', 3101]]) {
        const context = await browser.newContext({ viewport: size, reducedMotion: 'reduce' });
        try {
          await context.addCookies([{ name: 'aurum-locale', value: 'en', url: `http://127.0.0.1:${port}` }]);
          await context.addInitScript(value => localStorage.setItem('aurum-theme', value), theme);
          const page = await context.newPage();
          await page.route('https://fonts.googleapis.com/**', route => route.abort());
          await page.route('https://fonts.gstatic.com/**', route => route.abort());
          await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
          await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }' });
          await page.evaluate(() => document.fonts.ready);
          await page.screenshot({ path: `${directory}/${application}-${size.name}-${theme}.png`, fullPage: true, animations: 'disabled' });
        } finally { await context.close(); }
      }
    }
  }
  console.log('Created 12 English candidate screenshots; review is required.');
} finally { await browser.close(); }
