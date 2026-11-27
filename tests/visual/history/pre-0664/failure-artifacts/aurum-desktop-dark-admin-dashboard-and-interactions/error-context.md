# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aurum.spec.ts >> desktop-dark >> admin dashboard and interactions
- Location: tests/visual/aurum.spec.ts:20:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  375810 pixels (ratio 0.16 of all image pixels) are different.

  Snapshot: admin-desktop-dark.png

Call log:
  - Expect "toHaveScreenshot(admin-desktop-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 375810 pixels (ratio 0.16 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 375810 pixels (ratio 0.16 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: ✦
        - generic [ref=e6]:
          - strong [ref=e7]: aurum.
          - generic [ref=e8]: BUSINESS SUITE
      - generic [ref=e9]:
        - generic [ref=e10]: A
        - generic [ref=e11]:
          - strong [ref=e12]: Aurum Workspace
          - generic [ref=e13]: Chưa kết nối công ty
      - generic [ref=e17]:
        - strong [ref=e18]: Chi nhánh
        - generic [ref=e19]: Chưa có phạm vi được cấp
      - navigation "Điều hướng chính" [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: KHÔNG GIAN LÀM VIỆC
          - button "Tổng quan" [ref=e23] [cursor=pointer]
          - button "Phân tích" [ref=e30] [cursor=pointer]
          - button "Công việc" [ref=e34] [cursor=pointer]
        - generic [ref=e39]:
          - generic [ref=e40]: VẬN HÀNH
          - button "Bán hàng" [ref=e41] [cursor=pointer]
          - button "Kho hàng" [ref=e46] [cursor=pointer]
          - button "Mua hàng" [ref=e52] [cursor=pointer]
          - button "Nhân sự" [ref=e59] [cursor=pointer]
        - generic [ref=e66]:
          - generic [ref=e67]: HỆ THỐNG
          - button "Cài đặt" [ref=e68] [cursor=pointer]
          - button "Trung tâm trợ giúp" [ref=e73] [cursor=pointer]
      - generic [ref=e78]:
        - generic [ref=e79]:
          - generic [ref=e80]: ✧
          - strong [ref=e81]: Mọi thứ trong tầm tay.
          - paragraph [ref=e82]: Không gian điều hành cho doanh nghiệp của bạn.
          - button "Khám phá Aurum" [ref=e83] [cursor=pointer]
        - generic [ref=e86]:
          - generic [ref=e87]: A
          - generic [ref=e88]:
            - strong [ref=e89]: Aurum
            - generic [ref=e90]: Chưa đăng nhập
    - main [ref=e95]:
      - generic [ref=e96]:
        - generic [ref=e97]:
          - text: Không gian làm việc /
          - strong [ref=e98]: Tổng quan
        - generic [ref=e99]:
          - button "Tìm nhanh" [ref=e100] [cursor=pointer]: ⌕ Tìm nhanh
          - button "Chuyển sang giao diện sáng" [ref=e101] [cursor=pointer]:
            - text: ☀
            - generic [ref=e102]: Sáng
          - generic [ref=e103]: CHƯA KẾT NỐI DỮ LIỆU
          - group [ref=e104]:
            - generic "Phạm vi" [ref=e105] [cursor=pointer]
          - button "Thông báo" [ref=e106] [cursor=pointer]
          - generic [ref=e111]: A
          - generic [ref=e112]: Chưa đăng nhập
      - generic [ref=e113]:
        - generic [ref=e115]:
          - generic [ref=e116]: TỔNG QUAN DOANH NGHIỆP
          - heading [level=1] [ref=e118]:
            - text: Không gian
            - emphasis [ref=e119]: điều hành
            - text: ✳
          - paragraph [ref=e120]: Theo dõi hoạt động doanh nghiệp của bạn trong một nơi.
        - status [ref=e121]:
          - generic [ref=e126]:
            - strong [ref=e127]: Chưa thể hiển thị dữ liệu
            - paragraph [ref=e128]: Đăng nhập, phân quyền và kết nối dữ liệu doanh nghiệp đang được triển khai.
        - generic [ref=e130]:
          - text: 01 / TỔNG QUAN
          - heading "Bức tranh doanh nghiệp ✦" [level=2] [ref=e131]
          - paragraph [ref=e132]: Chỉ số sẽ hiển thị khi nguồn dữ liệu sẵn sàng.
        - region "Chỉ số tổng quan" [ref=e133]:
          - article [ref=e134]:
            - generic [ref=e135]: DOANH THU THÁNG
            - generic "Chưa có dữ liệu" [ref=e140]: —
            - generic [ref=e141]: Chưa kết nối dữ liệu
          - article [ref=e142]:
            - generic [ref=e143]: ĐƠN HÀNG ĐANG MỞ
            - generic "Chưa có dữ liệu" [ref=e149]: —
            - generic [ref=e150]: Chưa kết nối dữ liệu
          - article [ref=e151]:
            - generic [ref=e152]: SẢN PHẨM TRONG KHO
            - generic "Chưa có dữ liệu" [ref=e165]: —
            - generic [ref=e166]: Chưa kết nối dữ liệu
          - article [ref=e167]:
            - generic [ref=e168]: CẦN XỬ LÝ
            - generic "Chưa có dữ liệu" [ref=e174]: —
            - generic [ref=e175]: Chưa kết nối dữ liệu
        - generic [ref=e176]:
          - generic [ref=e177]:
            - generic [ref=e178]: HIỆU SUẤT KINH DOANH
            - heading "Doanh thu theo thời gian" [level=3] [ref=e179]
            - paragraph [ref=e180]: Xu hướng doanh thu sẽ hiển thị tại đây.
            - status [ref=e181]:
              - strong [ref=e182]: Chưa có dữ liệu để hiển thị
              - generic [ref=e183]: Kết nối nguồn dữ liệu doanh nghiệp để xem biểu đồ.
          - generic [ref=e184]:
            - generic [ref=e185]: CẦN BẠN QUAN TÂM
            - heading "Việc cần xử lý" [level=3] [ref=e186]
            - paragraph [ref=e187]: Theo dõi các tác vụ cần quan tâm.
            - generic [ref=e188]:
              - strong [ref=e192]: Chưa có thông tin
              - generic [ref=e193]: Danh sách công việc chưa được kết nối.
        - generic [ref=e194]:
          - generic [ref=e195]:
            - generic [ref=e196]: SUPPLY · INBOUND
            - heading "Đơn mua hàng gần đây" [level=3] [ref=e197]
            - generic [ref=e198]:
              - strong [ref=e203]: Chưa có dữ liệu
              - generic [ref=e204]: Đơn mua hàng chưa được kết nối.
          - generic [ref=e205]:
            - generic [ref=e206]: INVENTORY · AVAILABILITY
            - heading "Tình trạng kho" [level=3] [ref=e207]
            - generic [ref=e208]:
              - strong [ref=e219]: Chưa có dữ liệu
              - generic [ref=e220]: Thông tin kho chưa được kết nối.
        - region "Vận hành toàn cảnh" [ref=e221]:
          - generic [ref=e222]:
            - generic [ref=e223]:
              - text: 02 / PHÂN TÍCH
              - heading "Vận hành toàn cảnh" [level=2] [ref=e224]
              - paragraph [ref=e225]: Các báo cáo sẽ được mở khi dữ liệu và quyền truy cập sẵn sàng.
            - button "Chọn khoảng thời gian · Chưa kết nối" [disabled] [ref=e226] [cursor=pointer]
          - generic [ref=e227]:
            - article [ref=e228]:
              - generic [ref=e229]: PHÂN TÍCH
              - heading "Bán hàng" [level=3] [ref=e230]
              - paragraph [ref=e231]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e232]: —
            - article [ref=e233]:
              - generic [ref=e234]: PHÂN TÍCH
              - heading "Mua hàng" [level=3] [ref=e235]
              - paragraph [ref=e236]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e237]: —
            - article [ref=e238]:
              - generic [ref=e239]: PHÂN TÍCH
              - heading "Nhân sự" [level=3] [ref=e240]
              - paragraph [ref=e241]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e242]: —
            - article [ref=e243]:
              - generic [ref=e244]: PHÂN TÍCH
              - heading "Tài chính" [level=3] [ref=e245]
              - paragraph [ref=e246]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e247]: —
            - article [ref=e248]:
              - generic [ref=e249]: PHÂN TÍCH
              - heading "Hiệu quả vận hành" [level=3] [ref=e250]
              - paragraph [ref=e251]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e252]: —
            - article [ref=e253]:
              - generic [ref=e254]: PHÂN TÍCH
              - heading "So sánh kinh doanh" [level=3] [ref=e255]
              - paragraph [ref=e256]: Chưa kết nối dữ liệu
              - generic "Chưa có dữ liệu" [ref=e257]: —
        - generic [ref=e258]:
          - generic [ref=e259]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
          - generic [ref=e260]: Chưa kết nối dữ liệu
  - alert [ref=e261]
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