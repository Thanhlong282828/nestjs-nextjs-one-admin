# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aurum.spec.ts >> desktop-light >> admin dashboard and interactions
- Location: tests/visual/aurum.spec.ts:20:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  3162 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: hrm-desktop-light.png

Call log:
  - Expect "toHaveScreenshot(hrm-desktop-light.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 3162 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 3162 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
          - button "Nhân sự" [active] [ref=e59] [cursor=pointer]
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
          - strong [ref=e98]: Nhân sự
        - generic [ref=e99]:
          - button "Tìm nhanh" [ref=e100] [cursor=pointer]: ⌕ Tìm nhanh
          - generic [ref=e101]:
            - generic [ref=e102]: Ngôn ngữ
            - combobox "Ngôn ngữ" [ref=e103]:
              - option "Tiếng Việt · VI" [selected]
              - option "English · EN"
          - button "Chuyển sang giao diện tối" [ref=e104] [cursor=pointer]:
            - text: ☾
            - generic [ref=e105]: Tối
          - generic [ref=e106]: CHƯA KẾT NỐI DỮ LIỆU
          - group [ref=e107]:
            - generic "Phạm vi" [ref=e108] [cursor=pointer]
          - button "Thông báo" [ref=e109] [cursor=pointer]
          - generic [ref=e114]: A
          - generic [ref=e115]: Chưa đăng nhập
      - generic [ref=e116]:
        - generic [ref=e117]: VẬN HÀNH / Nhân sự / Tổng quan
        - generic [ref=e119]:
          - generic [ref=e120]: CON NGƯỜI & VĂN HÓA KHÔNG GIAN NHÂN SỰ
          - heading [level=1] [ref=e123]:
            - text: Con người tạo nên
            - emphasis [ref=e124]: khác biệt.
          - paragraph [ref=e125]: Một nơi để chăm sóc đội ngũ và đồng hành cùng sự phát triển.
        - status [ref=e126]:
          - generic [ref=e131]:
            - strong [ref=e132]: Dữ liệu nhân sự chưa được kết nối
            - paragraph [ref=e133]: Danh sách và báo cáo sẽ hiển thị khi đăng nhập và phân quyền công ty, chi nhánh được triển khai.
        - generic [ref=e135]:
          - text: 01 / TỔNG QUAN NHÂN SỰ
          - heading "Đội ngũ của bạn ✦" [level=2] [ref=e136]
          - paragraph [ref=e137]: Các chỉ số lấy từ dữ liệu doanh nghiệp khi hệ thống sẵn sàng.
        - region "Chỉ số nhân sự" [ref=e138]:
          - article [ref=e139]:
            - generic [ref=e140]: TỔNG NHÂN SỰ
            - strong [ref=e148]: —
            - paragraph [ref=e149]: Chưa kết nối dữ liệu
          - article [ref=e150]:
            - generic [ref=e151]: ĐANG LÀM VIỆC
            - strong [ref=e158]: —
            - paragraph [ref=e159]: Chưa kết nối dữ liệu
          - article [ref=e160]:
            - generic [ref=e161]: NGHỈ PHÉP HÔM NAY
            - strong [ref=e166]: —
            - paragraph [ref=e167]: Chưa kết nối dữ liệu
          - article [ref=e168]:
            - generic [ref=e169]: NHÂN SỰ MỚI
            - strong [ref=e175]: —
            - paragraph [ref=e176]: Chưa kết nối dữ liệu
        - generic [ref=e177]:
          - generic [ref=e178]:
            - generic [ref=e180]:
              - generic [ref=e181]: DANH BẠ NHÂN SỰ
              - heading "Danh sách nhân viên" [level=2] [ref=e182]
              - paragraph [ref=e183]: Quản lý và kết nối với những người trong tổ chức.
            - generic [ref=e184]:
              - strong [ref=e188]: Chưa thể tải danh sách
              - generic [ref=e189]: Kết nối dữ liệu và quyền truy cập chưa sẵn sàng.
          - complementary [ref=e190]:
            - generic [ref=e191]:
              - generic [ref=e192]:
                - generic [ref=e193]: ✳
                - generic [ref=e194]: CON NGƯỜI LÀ ĐIỀU QUAN TRỌNG
              - generic [ref=e195]: ✦
              - heading [level=3] [ref=e197]:
                - text: Đội ngũ vững mạnh,
                - emphasis [ref=e198]: doanh nghiệp vươn xa.
              - paragraph [ref=e199]: Mỗi thành viên đều là một phần quan trọng trong hành trình phát triển.
            - generic [ref=e200]:
              - generic [ref=e201]: CẦN BẠN QUAN TÂM
              - heading "Hoạt động gần đây" [level=3] [ref=e202]
              - generic [ref=e203]:
                - strong [ref=e204]: Chưa có thông tin
                - generic [ref=e205]: Hoạt động nhân sự chưa được kết nối.
        - region "Góc nhìn tổ chức ✦" [ref=e206]:
          - generic [ref=e208]:
            - generic [ref=e209]: 02 / PHÂN TÍCH NHÂN SỰ
            - heading "Góc nhìn tổ chức ✦" [level=2] [ref=e210]
            - paragraph [ref=e211]: Phân tích nhân sự theo công ty và chi nhánh.
          - generic [ref=e212]:
            - article [ref=e213]:
              - heading "Hành trình phát triển" [level=3] [ref=e214]
              - generic [ref=e215]:
                - strong [ref=e216]: Chưa có dữ liệu để hiển thị
                - generic [ref=e217]: Biểu đồ sẽ sẵn sàng khi dữ liệu được kết nối.
            - article [ref=e218]:
              - heading "Cơ cấu phòng ban" [level=3] [ref=e219]
              - generic [ref=e220]:
                - strong [ref=e221]: Chưa có dữ liệu để hiển thị
                - generic [ref=e222]: Biểu đồ sẽ sẵn sàng khi dữ liệu được kết nối.
            - article [ref=e223]:
              - heading "Mạng lưới chi nhánh" [level=3] [ref=e224]
              - generic [ref=e225]:
                - strong [ref=e226]: Chưa có dữ liệu để hiển thị
                - generic [ref=e227]: Biểu đồ sẽ sẵn sàng khi dữ liệu được kết nối.
        - generic [ref=e228]:
          - generic [ref=e229]: © Aurum Business Suite · Được thiết kế cho những điều lớn lao.
          - generic [ref=e230]: Chưa kết nối dữ liệu
  - alert [ref=e231]
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
> 41 |       await expect(page).toHaveScreenshot(`hrm-${size.name}-${theme}.png`, { fullPage: true });
     |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
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