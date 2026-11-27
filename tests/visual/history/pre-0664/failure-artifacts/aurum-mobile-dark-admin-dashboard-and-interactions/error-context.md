# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aurum.spec.ts >> mobile-dark >> admin dashboard and interactions
- Location: tests/visual/aurum.spec.ts:20:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  114452 pixels (ratio 0.10 of all image pixels) are different.

  Snapshot: admin-mobile-dark.png

Call log:
  - Expect "toHaveScreenshot(admin-mobile-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 114452 pixels (ratio 0.10 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 114452 pixels (ratio 0.10 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - button "Mở menu" [ref=e5] [cursor=pointer]
      - generic [ref=e7]:
        - button "Tìm nhanh" [ref=e8] [cursor=pointer]: ⌕
        - button "Chuyển sang giao diện sáng" [ref=e9] [cursor=pointer]:
          - text: ☀
          - generic [ref=e10]: Sáng
        - group [ref=e11]:
          - generic "Phạm vi" [ref=e12] [cursor=pointer]
        - button "Thông báo" [ref=e13] [cursor=pointer]
    - generic [ref=e17]:
      - generic [ref=e19]:
        - generic [ref=e20]: TỔNG QUAN DOANH NGHIỆP
        - heading [level=1] [ref=e22]:
          - text: Không gian
          - emphasis [ref=e23]: điều hành
          - text: ✳
        - paragraph [ref=e24]: Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.
      - status [ref=e25]:
        - generic [ref=e30]:
          - strong [ref=e31]: Chưa thể hiển thị dữ liệu
          - paragraph [ref=e32]: Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.
      - generic [ref=e34]:
        - text: 01 / TỔNG QUAN
        - heading "Bức tranh doanh nghiệp ✦" [level=2] [ref=e35]
        - paragraph [ref=e36]: Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.
      - region "Chỉ số tổng quan" [ref=e37]:
        - article [ref=e38]:
          - generic [ref=e39]: DOANH THU THÁNG
          - generic "Chưa có dữ liệu" [ref=e44]: —
          - generic [ref=e45]: Chưa kết nối dữ liệu
        - article [ref=e46]:
          - generic [ref=e47]: ĐƠN HÀNG ĐANG MỞ
          - generic "Chưa có dữ liệu" [ref=e53]: —
          - generic [ref=e54]: Chưa kết nối dữ liệu
        - article [ref=e55]:
          - generic [ref=e56]: SẢN PHẨM TRONG KHO
          - generic "Chưa có dữ liệu" [ref=e69]: —
          - generic [ref=e70]: Chưa kết nối dữ liệu
        - article [ref=e71]:
          - generic [ref=e72]: CẦN XỬ LÝ
          - generic "Chưa có dữ liệu" [ref=e78]: —
          - generic [ref=e79]: Chưa kết nối dữ liệu
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]: HIỆU SUẤT KINH DOANH
          - heading "Doanh thu theo thời gian" [level=3] [ref=e83]
          - paragraph [ref=e84]: Xu hướng doanh thu sẽ hiển thị tại đây.
          - status [ref=e85]:
            - strong [ref=e86]: Chưa có dữ liệu để hiển thị
            - generic [ref=e87]: Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.
        - generic [ref=e88]:
          - generic [ref=e89]: CẦN BẠN QUAN TÂM
          - heading "Việc cần xử lý" [level=3] [ref=e90]
          - paragraph [ref=e91]: Theo dõi các tác vụ cần quan tâm.
          - generic [ref=e92]:
            - strong [ref=e96]: Chưa có thông tin
            - generic [ref=e97]: Danh sách công việc chưa được kết nối.
      - generic [ref=e98]:
        - generic [ref=e99]:
          - generic [ref=e100]: SUPPLY · INBOUND
          - heading "Đơn mua hàng gần đây" [level=3] [ref=e101]
          - generic [ref=e102]:
            - strong [ref=e107]: Chưa có dữ liệu
            - generic [ref=e108]: Đơn mua hàng chưa được kết nối.
        - generic [ref=e109]:
          - generic [ref=e110]: INVENTORY · AVAILABILITY
          - heading "Tình trạng kho" [level=3] [ref=e111]
          - generic [ref=e112]:
            - strong [ref=e123]: Chưa có dữ liệu
            - generic [ref=e124]: Thông tin kho chưa được kết nối.
      - region "Vận hành toàn cảnh" [ref=e125]:
        - generic [ref=e126]:
          - generic [ref=e127]:
            - text: 02 / PHÂN TÍCH
            - heading "Vận hành toàn cảnh" [level=2] [ref=e128]
            - paragraph [ref=e129]: Các báo cáo sẽ được mở khi dữ liệu và quyền truy cập sẵn sàng.
          - button "Chọn khoảng thời gian · Chưa kết nối" [disabled] [ref=e130] [cursor=pointer]
        - generic [ref=e131]:
          - article [ref=e132]:
            - generic [ref=e133]: PHÂN TÍCH
            - heading "Bán hàng" [level=3] [ref=e134]
            - paragraph [ref=e135]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e136]: —
          - article [ref=e137]:
            - generic [ref=e138]: PHÂN TÍCH
            - heading "Mua hàng" [level=3] [ref=e139]
            - paragraph [ref=e140]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e141]: —
          - article [ref=e142]:
            - generic [ref=e143]: PHÂN TÍCH
            - heading "Nhân sự" [level=3] [ref=e144]
            - paragraph [ref=e145]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e146]: —
          - article [ref=e147]:
            - generic [ref=e148]: PHÂN TÍCH
            - heading "Tài chính" [level=3] [ref=e149]
            - paragraph [ref=e150]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e151]: —
          - article [ref=e152]:
            - generic [ref=e153]: PHÂN TÍCH
            - heading "Hiệu quả vận hành" [level=3] [ref=e154]
            - paragraph [ref=e155]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e156]: —
          - article [ref=e157]:
            - generic [ref=e158]: PHÂN TÍCH
            - heading "So sánh kinh doanh" [level=3] [ref=e159]
            - paragraph [ref=e160]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e161]: —
      - generic [ref=e162]:
        - generic [ref=e163]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
        - generic [ref=e164]: Chưa kết nối dữ liệu
  - alert [ref=e165]
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