/* global document */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  for (const width of [1440, 768, 390, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto('http://127.0.0.1:3190/?source=test#top', { waitUntil: 'networkidle' });
      await page.getByLabel('Ngôn ngữ').selectOption('en');
      await page.getByRole('heading', { name: /command center/ }).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(new URL(page.url()).search, '?source=test');
      assert.equal(new URL(page.url()).hash, '#top');
      const clipped = await page.locator('.topbar button, .topbar select, .topbar summary').evaluateAll(elements => elements.filter(e => { const r=e.getBoundingClientRect();return r.width && (r.left < 0 || r.right > document.documentElement.clientWidth); }).map(e => e.textContent));
      assert.deepEqual(clipped, [], `clipped header ${width}`);
      await page.getByRole('button', { name: 'Quick search' }).click();
      await page.getByRole('dialog', { name: 'Quick search' }).waitFor();
      await page.getByRole('button', { name: 'People', exact: true }).last().click();
      await page.getByRole('heading', { name: /People make the difference/ }).waitFor();
      await page.getByText('PEOPLE DIRECTORY', { exact: true }).waitFor();
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: /command center/ }).waitFor();
      await page.getByLabel('Language').selectOption('vi');
      await page.getByRole('heading', { name: /Không gian điều hành/ }).waitFor();
      await page.getByRole('button', { name: 'Tìm nhanh' }).click();
      await page.getByRole('dialog', { name: 'Tìm nhanh' }).getByRole('button', { name: 'Nhân sự', exact: true }).click();
      await page.getByText('DANH BẠ NHÂN SỰ', { exact: true }).waitFor();
    } finally { await page.close(); }
  }
  console.log('PASS: Admin locale, dialog, HRM, reload, URL and header bounds at 4 widths');
} finally { await browser.close(); }
