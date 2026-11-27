/* global document */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  for (const width of [1440, 768, 390, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    try {
      await page.goto('http://127.0.0.1:3101/?source=test#products', { waitUntil: 'networkidle' });
      const selector = page.getByLabel('Ngôn ngữ');
      await selector.selectOption('en');
      await page.getByRole('heading', { name: 'The collection is being prepared' }).waitFor();
      await page.getByText('AURUM SHOP · THE EVERYDAY EDIT', { exact: true }).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      assert.equal(new URL(page.url()).search, '?source=test');
      assert.equal(new URL(page.url()).hash, '#products');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `overflow ${width}`);
      assert.equal(await page.locator('.shop-header > *').evaluateAll(elements => elements.every(element => element.getBoundingClientRect().right <= document.documentElement.clientWidth)), true, `clipped header ${width}`);
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'The collection is being prepared' }).waitFor();
      await page.getByLabel('Language').focus();
      assert.equal(await page.getByLabel('Language').evaluate(element => element === document.activeElement), true);
      await page.getByLabel('Language').selectOption('vi');
      await page.getByRole('heading', { name: 'Danh mục đang được chuẩn bị' }).waitFor();
      await page.getByText('AURUM SHOP · TUYỂN CHỌN MỖI NGÀY', { exact: true }).waitFor();
      assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    } finally { await page.close(); }
  }
  console.log('PASS: storefront language selection, persistence, URL, select focus and 4 viewport overflow checks');
} finally { await browser.close(); }
