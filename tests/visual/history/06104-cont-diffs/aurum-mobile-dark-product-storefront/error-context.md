# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: aurum.spec.ts >> mobile-dark >> product storefront
- Location: tests/visual/aurum.spec.ts:43:5

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  Expected an image 390px by 3275px, received 390px by 3283px. 56074 pixels (ratio 0.05 of all image pixels) are different.

  Snapshot: product-mobile-dark.png

Call log:
  - Expect "toHaveScreenshot(product-mobile-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - Expected an image 390px by 3275px, received 390px by 3283px. 56074 pixels (ratio 0.05 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - Expected an image 390px by 3275px, received 390px by 3283px. 56074 pixels (ratio 0.05 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]: MỘT KHÔNG GIAN MUA SẮM ĐƯỢC CHỌN LỌC ✦ DÀNH RIÊNG CHO BẠN
    - generic [ref=e4]:
      - link "Aurum Shop trang chủ" [ref=e5] [cursor=pointer]:
        - /url: "#top"
        - text: ✦ AURUM SHOP
      - navigation "Điều hướng cửa hàng" [ref=e6]:
        - link "Khám phá" [ref=e7] [cursor=pointer]:
          - /url: "#discover"
        - link "Sản phẩm" [ref=e8] [cursor=pointer]:
          - /url: "#products"
        - link "Mua sắm" [ref=e9] [cursor=pointer]:
          - /url: "#shopping"
      - generic [ref=e10]:
        - generic [ref=e11]: Ngôn ngữ
        - combobox "Ngôn ngữ" [ref=e12]:
          - option "Tiếng Việt · VI" [selected]
          - option "English · EN"
      - button "Chuyển sang giao diện sáng" [ref=e13] [cursor=pointer]:
        - text: ☀
        - generic [ref=e14]: Sáng
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: AURUM SHOP · TUYỂN CHỌN MỖI NGÀY
        - heading [level=1] [ref=e19]:
          - text: Những điều đẹp đẽ,
          - emphasis [ref=e20]: theo cách của bạn.
        - paragraph [ref=e21]: Không gian mua sắm dành cho những lựa chọn thật ý nghĩa. Tinh tế trong từng chi tiết, gần gũi với mỗi ngày.
        - link "Khám phá cửa hàng ↗" [ref=e22] [cursor=pointer]:
          - /url: "#products"
          - text: Khám phá cửa hàng
          - generic [ref=e23]: ↗
        - generic [ref=e24]:
          - generic [ref=e25]: ✧
          - generic [ref=e26]:
            - text: CHỌN LỌC CHO BẠN
            - generic [ref=e27]: Trải nghiệm mua sắm Aurum
      - generic [aria-hidden] [ref=e28]:
        - generic [ref=e32]:
          - generic [ref=e33]: TUYỂN CHỌN AURUM
          - strong [ref=e34]: Đẹp trong từng khoảnh khắc.
          - generic [ref=e35]: ✦
          - generic [ref=e36]: CHỌN LỌC CHO ĐỜI SỐNG
        - generic [ref=e37]: THÊM MỘT CHÚT ĐẸP TRONG TỪNG NGÀY
    - generic [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]: 01 / CẢM HỨNG
        - strong [ref=e41]: Chọn điều bạn yêu.
      - paragraph [ref=e42]: Một góc nhỏ dành cho những khám phá mới và những điều làm cuộc sống thêm đặc biệt.
    - generic [ref=e43]:
      - generic [ref=e45]:
        - generic [ref=e46]: BỘ SƯU TẬP
        - heading "Khám phá sản phẩm." [level=2] [ref=e47]
        - paragraph [ref=e48]: Những lựa chọn dành cho phong cách riêng của bạn.
      - status [ref=e49]:
        - generic [ref=e50]: ✧
        - heading "Danh mục đang được chuẩn bị" [level=3] [ref=e51]
        - paragraph [ref=e52]: Sản phẩm sẽ xuất hiện tại đây khi cửa hàng kết nối dữ liệu.
        - generic [ref=e53]: VUI LÒNG QUAY LẠI SAU
    - region "Trải nghiệm dành cho bạn." [ref=e54]:
      - generic [ref=e55]: MUA SẮM CÙNG AURUM
      - heading "Trải nghiệm dành cho bạn." [level=2] [ref=e56]
      - paragraph [ref=e57]: Những tiện ích mua sắm đang được chuẩn bị.
      - generic [ref=e58]:
        - article [ref=e59]:
          - generic [ref=e60]: 01 / AURUM
          - heading "Tìm kiếm & bộ lọc" [level=3] [ref=e61]
          - paragraph [ref=e62]: Tìm kiếm sẽ khả dụng khi danh mục sản phẩm được kết nối.
          - text: ĐANG CHUẨN BỊ
        - article [ref=e63]:
          - generic [ref=e64]: 02 / AURUM
          - heading "Chi tiết sản phẩm" [level=3] [ref=e65]
          - paragraph [ref=e66]: Thông tin, giá và lựa chọn sản phẩm sẽ hiển thị từ cửa hàng.
          - text: ĐANG CHUẨN BỊ
        - article [ref=e67]:
          - generic [ref=e68]: 03 / AURUM
          - heading "Giỏ hàng & thanh toán" [level=3] [ref=e69]
          - paragraph [ref=e70]: Giỏ hàng và thanh toán chưa được kết nối.
          - text: ĐANG CHUẨN BỊ
        - article [ref=e71]:
          - generic [ref=e72]: 04 / AURUM
          - heading "Tài khoản & đơn hàng" [level=3] [ref=e73]
          - paragraph [ref=e74]: Tài khoản và theo dõi đơn hàng chưa khả dụng.
          - text: ĐANG CHUẨN BỊ
    - generic [ref=e75]:
      - link "✦ AURUM SHOP" [ref=e76] [cursor=pointer]:
        - /url: "#top"
      - paragraph [ref=e77]: Một chút tinh tế cho mỗi ngày.
      - generic [ref=e78]: © Aurum Shop
  - alert [ref=e79]
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
  41 |       await expect(page).toHaveScreenshot(`hrm-${size.name}-${theme}.png`, { fullPage: true });
  42 |     });
  43 |     test('product storefront', async ({ page }) => {
  44 |       await prepare(page, theme, 3101);
  45 |       await expect(page.getByRole('heading', { name: /Những điều đẹp đẽ/ })).toBeVisible();
  46 |       await expect(page.getByRole('heading', { name: 'Danh mục đang được chuẩn bị' })).toBeVisible();
> 47 |       await expect(page).toHaveScreenshot(`product-${size.name}-${theme}.png`, { fullPage: true });
     |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  48 |     });
  49 |   });
  50 | }
  51 | 
```