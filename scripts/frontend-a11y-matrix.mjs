/* global document, getComputedStyle, matchMedia */
// Local production smoke matrix; run after starting apps on loopback 3190 and 3101.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
let checked = 0;
try {
  for (const port of [3190, 3101]) {
    for (const width of [1920, 1440, 1280, 1024, 768, 390, 375]) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        try {
          await page.addInitScript(value => localStorage.setItem('aurum-theme', value), theme);
          await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
          const state = await page.evaluate(() => ({
            width: document.documentElement.clientWidth,
            scroll: document.documentElement.scrollWidth,
            theme: document.documentElement.dataset.theme,
          }));
          assert.equal(state.scroll, state.width, `horizontal overflow: ${port}/${width}/${theme}`);
          assert.equal(state.theme, theme, `theme: ${port}/${width}/${theme}`);
          if (width === 1440) {
            const cdp = await page.context().newCDPSession(page);
            for (const [name, value] of [['forced-colors', 'active'], ['prefers-reduced-transparency', 'reduce']]) {
              await cdp.send('Emulation.setEmulatedMedia', { features: [{ name, value }] });
              const fallback = await page.evaluate(({ name: feature, value: setting }) => {
                const surface = document.querySelector('.glass-surface');
                if (!surface) throw new Error('No glass surface');
                const style = getComputedStyle(surface);
                return { matches: matchMedia(`(${feature}: ${setting})`).matches, blur: style.backdropFilter, background: style.backgroundColor };
              }, { name, value });
              assert.equal(fallback.matches, true, `${name} emulation unavailable`);
              assert.equal(fallback.blur, 'none', `${name} did not disable blur`);
              assert.notEqual(fallback.background, 'rgba(0, 0, 0, 0)', `${name} surface is transparent`);
            }
          }
          checked++;
        } finally {
          await page.close();
        }
      }
    }
  }
  console.log(`PASS: ${checked} viewport/theme combinations; forced-colors and reduced-transparency smoke checks`);
} finally {
  await browser.close();
}
