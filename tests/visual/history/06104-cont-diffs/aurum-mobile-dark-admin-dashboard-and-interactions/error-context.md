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

  Expected an image 390px by 3162px, received 390px by 3205px. 73497 pixels (ratio 0.06 of all image pixels) are different.

  Snapshot: admin-mobile-dark.png

Call log:
  - Expect "toHaveScreenshot(admin-mobile-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 390px by 3162px, received 390px by 3205px. 73497 pixels (ratio 0.06 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 390px by 3162px, received 390px by 3205px. 73497 pixels (ratio 0.06 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - button "Mở menu" [ref=e5] [cursor=pointer]
      - generic [ref=e7]:
        - button "Tìm nhanh" [ref=e8] [cursor=pointer]: ⌕
        - generic [ref=e9]:
          - generic [ref=e10]: Ngôn ngữ
          - combobox "Ngôn ngữ" [ref=e11]:
            - option "Tiếng Việt · VI" [selected]
            - option "English · EN"
        - button "Chuyển sang giao diện sáng" [ref=e12] [cursor=pointer]:
          - text: ☀
          - generic [ref=e13]: Sáng
        - group [ref=e14]:
          - generic "Phạm vi" [ref=e15] [cursor=pointer]
        - button "Thông báo" [ref=e16] [cursor=pointer]
    - generic [ref=e20]:
      - generic [ref=e22]:
        - generic [ref=e23]: TỔNG QUAN DOANH NGHIỆP
        - heading [level=1] [ref=e25]:
          - text: Không gian
          - emphasis [ref=e26]: điều hành
          - text: ✳
        - paragraph [ref=e27]: Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.
      - status [ref=e28]:
        - generic [ref=e33]:
          - strong [ref=e34]: Chưa thể hiển thị dữ liệu
          - paragraph [ref=e35]: Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.
      - generic [ref=e37]:
        - text: 01 / TỔNG QUAN
        - heading "Bức tranh doanh nghiệp ✦" [level=2] [ref=e38]
        - paragraph [ref=e39]: Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.
      - region "Chỉ số tổng quan" [ref=e40]:
        - article [ref=e41]:
          - generic [ref=e42]: DOANH THU THÁNG
          - generic "Chưa có dữ liệu" [ref=e47]: —
          - generic [ref=e48]: Chưa kết nối dữ liệu
        - article [ref=e49]:
          - generic [ref=e50]: ĐƠN HÀNG ĐANG MỞ
          - generic "Chưa có dữ liệu" [ref=e56]: —
          - generic [ref=e57]: Chưa kết nối dữ liệu
        - article [ref=e58]:
          - generic [ref=e59]: SẢN PHẨM TRONG KHO
          - generic "Chưa có dữ liệu" [ref=e72]: —
          - generic [ref=e73]: Chưa kết nối dữ liệu
        - article [ref=e74]:
          - generic [ref=e75]: CẦN XỬ LÝ
          - generic "Chưa có dữ liệu" [ref=e81]: —
          - generic [ref=e82]: Chưa kết nối dữ liệu
      - generic [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]: HIỆU SUẤT KINH DOANH
          - heading "Doanh thu theo thời gian" [level=3] [ref=e86]
          - paragraph [ref=e87]: Xu hướng doanh thu sẽ hiển thị tại đây.
          - status [ref=e88]:
            - strong [ref=e89]: Chưa có dữ liệu để hiển thị
            - generic [ref=e90]: Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.
        - generic [ref=e91]:
          - generic [ref=e92]: CẦN BẠN QUAN TÂM
          - heading "Việc cần xử lý" [level=3] [ref=e93]
          - paragraph [ref=e94]: Theo dõi các tác vụ cần quan tâm.
          - generic [ref=e95]:
            - strong [ref=e99]: Chưa có thông tin
            - generic [ref=e100]: Danh sách công việc chưa được kết nối.
      - generic [ref=e101]:
        - generic [ref=e102]:
          - generic [ref=e103]: CUNG ỨNG · NHẬP HÀNG
          - heading "Đơn mua hàng gần đây" [level=3] [ref=e104]
          - generic [ref=e105]:
            - strong [ref=e110]: Chưa có dữ liệu
            - generic [ref=e111]: Đơn mua hàng chưa được kết nối.
        - generic [ref=e112]:
          - generic [ref=e113]: KHO HÀNG · SẴN CÓ
          - heading "Tình trạng kho" [level=3] [ref=e114]
          - generic [ref=e115]:
            - strong [ref=e126]: Chưa có dữ liệu
            - generic [ref=e127]: Thông tin kho chưa được kết nối.
      - region "Vận hành toàn cảnh" [ref=e128]:
        - generic [ref=e129]:
          - generic [ref=e130]:
            - text: 02 / PHÂN TÍCH
            - heading "Vận hành toàn cảnh" [level=2] [ref=e131]
            - paragraph [ref=e132]: Các báo cáo sẽ được mở khi dữ liệu và quyền truy cập sẵn sàng.
          - button "Chọn khoảng thời gian · Chưa kết nối" [disabled] [ref=e133] [cursor=pointer]
        - generic [ref=e134]:
          - article [ref=e135]:
            - generic [ref=e136]: Phân tích
            - heading "Bán hàng" [level=3] [ref=e137]
            - paragraph [ref=e138]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e139]: —
          - article [ref=e140]:
            - generic [ref=e141]: Phân tích
            - heading "Mua hàng" [level=3] [ref=e142]
            - paragraph [ref=e143]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e144]: —
          - article [ref=e145]:
            - generic [ref=e146]: Phân tích
            - heading "Nhân sự" [level=3] [ref=e147]
            - paragraph [ref=e148]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e149]: —
          - article [ref=e150]:
            - generic [ref=e151]: Phân tích
            - heading "Tài chính" [level=3] [ref=e152]
            - paragraph [ref=e153]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e154]: —
          - article [ref=e155]:
            - generic [ref=e156]: Phân tích
            - heading "Hiệu quả vận hành" [level=3] [ref=e157]
            - paragraph [ref=e158]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e159]: —
          - article [ref=e160]:
            - generic [ref=e161]: Phân tích
            - heading "So sánh kinh doanh" [level=3] [ref=e162]
            - paragraph [ref=e163]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e164]: —
      - generic [ref=e165]:
        - generic [ref=e166]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
        - generic [ref=e167]: Chưa kết nối dữ liệu
  - alert [ref=e168]
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