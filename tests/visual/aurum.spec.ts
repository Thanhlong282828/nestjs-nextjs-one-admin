import { expect, test, type Page } from '@playwright/test';

const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;
async function prepare(page: Page, theme: 'light' | 'dark', port: number) {
  await page.addInitScript(value => localStorage.setItem('aurum-theme', value), theme);
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
}
for (const size of sizes) for (const theme of ['light', 'dark'] as const) {
  test.describe(`${size.name}-${theme}`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });
    test('admin dashboard and interactions', async ({ page }) => {
      await prepare(page, theme, 3190);
      await expect(page.getByRole('heading', { name: /Không gian điều hành/ })).toBeVisible();
      await expect(page).toHaveScreenshot(`admin-${size.name}-${theme}.png`, { fullPage: true });
      await page.getByRole('button', { name: 'Tìm nhanh' }).click();
      await expect(page.getByRole('dialog', { name: 'Tìm nhanh' })).toBeVisible();
      await expect(page).toHaveScreenshot(`palette-${size.name}-${theme}.png`);
      await page.keyboard.press('Escape');
      await page.getByText('Phạm vi', { exact: true }).click();
      await expect(page.getByText('Phạm vi truy cập chưa được kết nối.')).toBeVisible();
      await expect(page).toHaveScreenshot(`dropdown-${size.name}-${theme}.png`);
      await page.keyboard.press('Escape');
      if (size.width <= 900) {
        await page.getByRole('button', { name: 'Mở menu' }).click();
        await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
        await expect(page).toHaveScreenshot(`sidebar-${size.name}-${theme}.png`);
      }
      await page.getByRole('button', { name: 'Nhân sự', exact: true }).click();
      await expect(page.getByRole('heading', { name: /Con người tạo nên/ })).toBeVisible();
      await expect(page.locator('.people-card').getByRole('heading', { name: /Đội ngũ vững mạnh/ })).toBeVisible();
      await expect(page.locator('.people-card').getByText(/Mỗi thành viên đều là một phần quan trọng/)).toBeVisible();
      await expect(page).toHaveScreenshot(`hrm-${size.name}-${theme}.png`, { fullPage: true });
    });
    test('product storefront', async ({ page }) => {
      await prepare(page, theme, 3101);
      await expect(page.getByRole('heading', { name: /Những điều đẹp đẽ/ })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Danh mục đang được chuẩn bị' })).toBeVisible();
      await expect(page).toHaveScreenshot(`product-${size.name}-${theme}.png`, { fullPage: true });
    });
  });
}
