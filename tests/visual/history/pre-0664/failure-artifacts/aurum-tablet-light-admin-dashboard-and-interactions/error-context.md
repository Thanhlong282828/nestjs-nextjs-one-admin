# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aurum.spec.ts >> tablet-light >> admin dashboard and interactions
- Location: tests/visual/aurum.spec.ts:20:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  2502 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: admin-tablet-light.png

Call log:
  - Expect "toHaveScreenshot(admin-tablet-light.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 2502 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 2502 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - button "Mở menu" [ref=e5] [cursor=pointer]
      - generic [ref=e7]:
        - text: Không gian làm việc /
        - strong [ref=e8]: Tổng quan
      - generic [ref=e9]:
        - button "Tìm nhanh" [ref=e10] [cursor=pointer]: ⌕ Tìm nhanh
        - button "Chuyển sang giao diện tối" [ref=e11] [cursor=pointer]:
          - text: ☾
          - generic [ref=e12]: Tối
        - group [ref=e13]:
          - generic "Phạm vi" [ref=e14] [cursor=pointer]
        - button "Thông báo" [ref=e15] [cursor=pointer]
    - generic [ref=e19]:
      - generic [ref=e21]:
        - generic [ref=e22]: TỔNG QUAN DOANH NGHIỆP
        - heading [level=1] [ref=e24]:
          - text: Không gian
          - emphasis [ref=e25]: điều hành
          - text: ✳
        - paragraph [ref=e26]: Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.
      - status [ref=e27]:
        - generic [ref=e32]:
          - strong [ref=e33]: Chưa thể hiển thị dữ liệu
          - paragraph [ref=e34]: Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.
      - generic [ref=e36]:
        - text: 01 / TỔNG QUAN
        - heading "Bức tranh doanh nghiệp ✦" [level=2] [ref=e37]
        - paragraph [ref=e38]: Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.
      - region "Chỉ số tổng quan" [ref=e39]:
        - article [ref=e40]:
          - generic [ref=e41]: DOANH THU THÁNG
          - generic "Chưa có dữ liệu" [ref=e46]: —
          - generic [ref=e47]: Chưa kết nối dữ liệu
        - article [ref=e48]:
          - generic [ref=e49]: ĐƠN HÀNG ĐANG MỞ
          - generic "Chưa có dữ liệu" [ref=e55]: —
          - generic [ref=e56]: Chưa kết nối dữ liệu
        - article [ref=e57]:
          - generic [ref=e58]: SẢN PHẨM TRONG KHO
          - generic "Chưa có dữ liệu" [ref=e71]: —
          - generic [ref=e72]: Chưa kết nối dữ liệu
        - article [ref=e73]:
          - generic [ref=e74]: CẦN XỬ LÝ
          - generic "Chưa có dữ liệu" [ref=e80]: —
          - generic [ref=e81]: Chưa kết nối dữ liệu
      - generic [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]: HIỆU SUẤT KINH DOANH
          - heading "Doanh thu theo thời gian" [level=3] [ref=e85]
          - paragraph [ref=e86]: Xu hướng doanh thu sẽ hiển thị tại đây.
          - status [ref=e87]:
            - strong [ref=e88]: Chưa có dữ liệu để hiển thị
            - generic [ref=e89]: Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.
        - generic [ref=e90]:
          - generic [ref=e91]: CẦN BẠN QUAN TÂM
          - heading "Việc cần xử lý" [level=3] [ref=e92]
          - paragraph [ref=e93]: Theo dõi các tác vụ cần quan tâm.
          - generic [ref=e94]:
            - strong [ref=e98]: Chưa có thông tin
            - generic [ref=e99]: Danh sách công việc chưa được kết nối.
      - generic [ref=e100]:
        - generic [ref=e101]:
          - generic [ref=e102]: SUPPLY · INBOUND
          - heading "Đơn mua hàng gần đây" [level=3] [ref=e103]
          - generic [ref=e104]:
            - strong [ref=e109]: Chưa có dữ liệu
            - generic [ref=e110]: Đơn mua hàng chưa được kết nối.
        - generic [ref=e111]:
          - generic [ref=e112]: INVENTORY · AVAILABILITY
          - heading "Tình trạng kho" [level=3] [ref=e113]
          - generic [ref=e114]:
            - strong [ref=e125]: Chưa có dữ liệu
            - generic [ref=e126]: Thông tin kho chưa được kết nối.
      - region "Vận hành toàn cảnh" [ref=e127]:
        - generic [ref=e128]:
          - generic [ref=e129]:
            - text: 02 / PHÂN TÍCH
            - heading "Vận hành toàn cảnh" [level=2] [ref=e130]
            - paragraph [ref=e131]: Các báo cáo sẽ được mở khi dữ liệu và quyền truy cập sẵn sàng.
          - button "Chọn khoảng thời gian · Chưa kết nối" [disabled] [ref=e132] [cursor=pointer]
        - generic [ref=e133]:
          - article [ref=e134]:
            - generic [ref=e135]: PHÂN TÍCH
            - heading "Bán hàng" [level=3] [ref=e136]
            - paragraph [ref=e137]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e138]: —
          - article [ref=e139]:
            - generic [ref=e140]: PHÂN TÍCH
            - heading "Mua hàng" [level=3] [ref=e141]
            - paragraph [ref=e142]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e143]: —
          - article [ref=e144]:
            - generic [ref=e145]: PHÂN TÍCH
            - heading "Nhân sự" [level=3] [ref=e146]
            - paragraph [ref=e147]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e148]: —
          - article [ref=e149]:
            - generic [ref=e150]: PHÂN TÍCH
            - heading "Tài chính" [level=3] [ref=e151]
            - paragraph [ref=e152]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e153]: —
          - article [ref=e154]:
            - generic [ref=e155]: PHÂN TÍCH
            - heading "Hiệu quả vận hành" [level=3] [ref=e156]
            - paragraph [ref=e157]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e158]: —
          - article [ref=e159]:
            - generic [ref=e160]: PHÂN TÍCH
            - heading "So sánh kinh doanh" [level=3] [ref=e161]
            - paragraph [ref=e162]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e163]: —
      - generic [ref=e164]:
        - generic [ref=e165]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
        - generic [ref=e166]: Chưa kết nối dữ liệu
  - alert [ref=e167]
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | 
  3  | const sizes = [
  4  |   { name: 'desktop', width: 1440, height: 900 },
  5  |   { name: 'tablet', width: 768, height: 1024 },
  6  |   { name: 'mobile', width: 390, height: 844 },
  7  | ] as const;
  8  | async function prepare(page: Page, theme: 'light' | 'dark', port: number) {
  9  |   await page.addInitScript(value => localStorage.setItem('aurum-theme', value), theme);
  10 |   await page.route('https://fonts.googleapis.com/**', route => route.abort());
  11 |   await page.route('https://fonts.gstatic.com/**', route => route.abort());
  12 |   await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  13 |   await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }' });
  14 |   await page.evaluate(() => document.fonts.ready);
  15 |   await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  16 | }
  17 | for (const size of sizes) for (const theme of ['light', 'dark'] as const) {
  18 |   test.describe(`${size.name}-${theme}`, () => {
  19 |     test.use({ viewport: { width: size.width, height: size.height } });
  20 |     test('admin dashboard and interactions', async ({ page }) => {
  21 |       await prepare(page, theme, 3190);
  22 |       await expect(page.getByRole('heading', { name: /Không gian điều hành/ })).toBeVisible();
> 23 |       await expect(page).toHaveScreenshot(`admin-${size.name}-${theme}.png`, { fullPage: true });
     |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  24 |       await page.getByRole('button', { name: 'Tìm nhanh' }).click();
  25 |       await expect(page.getByRole('dialog', { name: 'Tìm nhanh' })).toBeVisible();
  26 |       await expect(page).toHaveScreenshot(`palette-${size.name}-${theme}.png`);
  27 |       await page.keyboard.press('Escape');
  28 |       await page.getByText('Phạm vi', { exact: true }).click();
  29 |       await expect(page.getByText('Phạm vi truy cập chưa được kết nối.')).toBeVisible();
  30 |       await expect(page).toHaveScreenshot(`dropdown-${size.name}-${theme}.png`);
  31 |       await page.keyboard.press('Escape');
  32 |       if (size.width <= 900) {
  33 |         await page.getByRole('button', { name: 'Mở menu' }).click();
  34 |         await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible();
  35 |         await expect(page).toHaveScreenshot(`sidebar-${size.name}-${theme}.png`);
  36 |       }
  37 |       await page.getByRole('button', { name: 'Nhân sự', exact: true }).click();
  38 |       await expect(page.getByRole('heading', { name: /Con người tạo nên/ })).toBeVisible();
  39 |       await expect(page.locator('.people-card').getByRole('heading', { name: /Đội ngũ vững mạnh/ })).toBeVisible();
  40 |       await expect(page.locator('.people-card').getByText(/Mỗi thành viên đều là một phần quan trọng/)).toBeVisible();
  41 |       await expect(page).toHaveScreenshot(`hrm-${size.name}-${theme}.png`, { fullPage: true });
  42 |     });
  43 |     test('product storefront', async ({ page }) => {
  44 |       await prepare(page, theme, 3101);
  45 |       await expect(page.getByRole('heading', { name: /Những điều đẹp đẽ/ })).toBeVisible();
  46 |       await expect(page.getByRole('heading', { name: 'Danh mục đang được chuẩn bị' })).toBeVisible();
  47 |       await expect(page).toHaveScreenshot(`product-${size.name}-${theme}.png`, { fullPage: true });
  48 |     });
  49 |   });
  50 | }
  51 | 
```