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

  1220 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: dropdown-tablet-light.png

Call log:
  - Expect "toHaveScreenshot(dropdown-tablet-light.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 1220 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 1220 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - button "Mở menu" [ref=e5] [cursor=pointer]
      - generic [ref=e7]:
        - text: Không gian làm việc /
        - strong [ref=e8]: Tổng quan
      - generic [ref=e9]:
        - button "Tìm nhanh" [ref=e10] [cursor=pointer]: ⌕ Tìm nhanh
        - generic [ref=e11]:
          - generic [ref=e12]: Ngôn ngữ
          - combobox "Ngôn ngữ" [ref=e13]:
            - option "Tiếng Việt · VI" [selected]
            - option "English · EN"
        - button "Chuyển sang giao diện tối" [ref=e14] [cursor=pointer]:
          - text: ☾
          - generic [ref=e15]: Tối
        - group [ref=e16]:
          - generic "Phạm vi" [active] [ref=e17] [cursor=pointer]
          - generic [ref=e18]:
            - strong [ref=e19]: Công ty và chi nhánh
            - paragraph [ref=e20]: Phạm vi truy cập chưa được kết nối.
        - button "Thông báo" [ref=e21] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]: TỔNG QUAN DOANH NGHIỆP
        - heading [level=1] [ref=e30]:
          - text: Không gian
          - emphasis [ref=e31]: điều hành
          - text: ✳
        - paragraph [ref=e32]: Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.
      - status [ref=e33]:
        - generic [ref=e38]:
          - strong [ref=e39]: Chưa thể hiển thị dữ liệu
          - paragraph [ref=e40]: Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.
      - generic [ref=e42]:
        - text: 01 / TỔNG QUAN
        - heading "Bức tranh doanh nghiệp ✦" [level=2] [ref=e43]
        - paragraph [ref=e44]: Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.
      - region "Chỉ số tổng quan" [ref=e45]:
        - article [ref=e46]:
          - generic [ref=e47]: DOANH THU THÁNG
          - generic "Chưa có dữ liệu" [ref=e52]: —
          - generic [ref=e53]: Chưa kết nối dữ liệu
        - article [ref=e54]:
          - generic [ref=e55]: ĐƠN HÀNG ĐANG MỞ
          - generic "Chưa có dữ liệu" [ref=e61]: —
          - generic [ref=e62]: Chưa kết nối dữ liệu
        - article [ref=e63]:
          - generic [ref=e64]: SẢN PHẨM TRONG KHO
          - generic "Chưa có dữ liệu" [ref=e77]: —
          - generic [ref=e78]: Chưa kết nối dữ liệu
        - article [ref=e79]:
          - generic [ref=e80]: CẦN XỬ LÝ
          - generic "Chưa có dữ liệu" [ref=e86]: —
          - generic [ref=e87]: Chưa kết nối dữ liệu
      - generic [ref=e88]:
        - generic [ref=e89]:
          - generic [ref=e90]: HIỆU SUẤT KINH DOANH
          - heading "Doanh thu theo thời gian" [level=3] [ref=e91]
          - paragraph [ref=e92]: Xu hướng doanh thu sẽ hiển thị tại đây.
          - status [ref=e93]:
            - strong [ref=e94]: Chưa có dữ liệu để hiển thị
            - generic [ref=e95]: Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.
        - generic [ref=e96]:
          - generic [ref=e97]: CẦN BẠN QUAN TÂM
          - heading "Việc cần xử lý" [level=3] [ref=e98]
          - paragraph [ref=e99]: Theo dõi các tác vụ cần quan tâm.
          - generic [ref=e100]:
            - strong [ref=e104]: Chưa có thông tin
            - generic [ref=e105]: Danh sách công việc chưa được kết nối.
      - generic [ref=e106]:
        - generic [ref=e107]:
          - generic [ref=e108]: SUPPLY · INBOUND
          - heading "Đơn mua hàng gần đây" [level=3] [ref=e109]
          - generic [ref=e110]:
            - strong [ref=e115]: Chưa có dữ liệu
            - generic [ref=e116]: Đơn mua hàng chưa được kết nối.
        - generic [ref=e117]:
          - generic [ref=e118]: INVENTORY · AVAILABILITY
          - heading "Tình trạng kho" [level=3] [ref=e119]
          - generic [ref=e120]:
            - strong [ref=e131]: Chưa có dữ liệu
            - generic [ref=e132]: Thông tin kho chưa được kết nối.
      - region "Vận hành toàn cảnh" [ref=e133]:
        - generic [ref=e134]:
          - generic [ref=e135]:
            - text: 02 / PHÂN TÍCH
            - heading "Vận hành toàn cảnh" [level=2] [ref=e136]
            - paragraph [ref=e137]: Các báo cáo sẽ được mở khi dữ liệu và quyền truy cập sẵn sàng.
          - button "Chọn khoảng thời gian · Chưa kết nối" [disabled] [ref=e138] [cursor=pointer]
        - generic [ref=e139]:
          - article [ref=e140]:
            - generic [ref=e141]: Phân tích
            - heading "Bán hàng" [level=3] [ref=e142]
            - paragraph [ref=e143]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e144]: —
          - article [ref=e145]:
            - generic [ref=e146]: Phân tích
            - heading "Mua hàng" [level=3] [ref=e147]
            - paragraph [ref=e148]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e149]: —
          - article [ref=e150]:
            - generic [ref=e151]: Phân tích
            - heading "Nhân sự" [level=3] [ref=e152]
            - paragraph [ref=e153]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e154]: —
          - article [ref=e155]:
            - generic [ref=e156]: Phân tích
            - heading "Tài chính" [level=3] [ref=e157]
            - paragraph [ref=e158]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e159]: —
          - article [ref=e160]:
            - generic [ref=e161]: Phân tích
            - heading "Hiệu quả vận hành" [level=3] [ref=e162]
            - paragraph [ref=e163]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e164]: —
          - article [ref=e165]:
            - generic [ref=e166]: Phân tích
            - heading "So sánh kinh doanh" [level=3] [ref=e167]
            - paragraph [ref=e168]: Chưa kết nối dữ liệu
            - generic "Chưa có dữ liệu" [ref=e169]: —
      - generic [ref=e170]:
        - generic [ref=e171]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
        - generic [ref=e172]: Chưa kết nối dữ liệu
  - alert [ref=e173]
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
  23 |       await expect(page).toHaveScreenshot(`admin-${size.name}-${theme}.png`, { fullPage: true });
  24 |       await page.getByRole('button', { name: 'Tìm nhanh' }).click();
  25 |       await expect(page.getByRole('dialog', { name: 'Tìm nhanh' })).toBeVisible();
  26 |       await expect(page).toHaveScreenshot(`palette-${size.name}-${theme}.png`);
  27 |       await page.keyboard.press('Escape');
  28 |       await page.getByText('Phạm vi', { exact: true }).click();
  29 |       await expect(page.getByText('Phạm vi truy cập chưa được kết nối.')).toBeVisible();
> 30 |       await expect(page).toHaveScreenshot(`dropdown-${size.name}-${theme}.png`);
     |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
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