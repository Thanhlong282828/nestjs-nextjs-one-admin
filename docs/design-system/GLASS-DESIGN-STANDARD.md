# Aurum permanent visual design law

Áp dụng cho cả admin và customer commerce. Chủ dự án cho phép thay thế toàn bộ UI cũ; bảo toàn nghiệp vụ, route, API, dữ liệu, xác thực và phân quyền. Thiết kế gold/champagne, warm dark và neutral light, kính nhiều lớp có vibrancy, phản xạ và ánh sáng môi trường; ưu tiên đọc, độ tương phản, typography, khoảng cách, responsive và sự nhất quán. Không dùng hiệu ứng kính dày trên mọi ô bảng; hỗ trợ giảm chuyển động và giảm trong suốt. Chỉ dùng một hệ token và primitives trong `packages/ui-glass`; không tạo hệ token riêng giữa các app. Bàn phím, tên truy cập, trạng thái focus và nội dung thay thế là yêu cầu thiết kế; WCAG 2.2 AA chỉ được công bố sau khi kiểm thử đầy đủ.

Không dựng dữ liệu nghiệp vụ, quyền, công ty, chi nhánh, sản phẩm, đơn hàng hoặc số liệu giả. Các tác vụ chưa có backend an toàn phải thông báo chưa kết nối, không giả thao tác thành công. Company/branch lấy phạm vi từ server đã xác thực. Chỉ nối API sau khi authentication, authorization và tenant isolation được xác minh. Không tạo giỏ hàng/checkout/đơn hàng giả để trang có vẻ hoạt động.

Mọi thay đổi phải được kiểm tra các trạng thái thực tế, responsive, tương phản, bàn phím, screen reader và reduced motion/transparency tương ứng; ghi rõ các phần chưa xác minh. Thiết kế reusable có thể được cải tiến hoặc thay thế, không bắt buộc giữ backward visual compatibility. Quyết định và evidence tại `docs/PROGRESS.md`, `MASTER_CONTEXT.md` và `IMPLEMENTATION_HANDOFF.md`.

## QA checkpoint 2026-11-26
Chrome headless và axe được chạy ở sáu kích thước, hai theme cho hai trang ban đầu; không có violation tự động được báo. Không coi kết quả tự động là chứng nhận WCAG. Cần tiếp tục screen reader thật, Safari, kiểm thử dialog/popover và trạng thái dữ liệu động, reduced transparency và benchmark ảnh hưởng blur. Các component không dùng chưa có bảo đảm QA riêng; xem `docs/PROGRESS.md`.

## QA 06.2
`npm run test:glass` kiểm tra render và semantics cơ bản, không thay cho browser interaction, VoiceOver hoặc đánh giá tương phản. Card metric/analytics/HRM lặp không tự blur để hạn chế các lớp compositing; bề mặt quan trọng vẫn có glass. Chrome và axe kiểm tra trang ban đầu; Safari, hỗ trợ giảm trong suốt trên thiết bị thực và hiệu năng GPU cần kiểm chứng tiếp.

## Ranh giới render và QA 06.3
Primitive thuần nằm trong `packages/ui-glass/surface.tsx` không yêu cầu client boundary; các tương tác/hiệu ứng React nằm trong `components.tsx` và `theme-toggle.tsx`. Export cũ vẫn tồn tại. Storefront nhập primitives trực tiếp để tránh đưa chúng qua client boundary không cần thiết. Dung lượng static tổng thư mục sau build không phải kích thước tải theo route hoặc benchmark GPU. Kiểm tra thủ công screen reader/Safari, tương phản trên nền glass và test tương tác nhiều trạng thái vẫn bắt buộc.

## Interaction QA 06.4
`GlassDialog` dùng native dialog, chặn Tab/Shift+Tab tại hai đầu các control hiển thị; Escape đóng và phục hồi focus theo browser. Popover dùng native details, Enter/Space và Escape. Khi `backdrop-filter` và `-webkit-backdrop-filter` không được hỗ trợ, surface dùng màu đặc; reduced transparency và forced-colors cũng tắt blur. ADR: `docs/architecture/decisions/0001-glass-dialog-and-surface-fallback.md`. Bộ browser smoke test `npm run test:glass:browser` yêu cầu hai server localhost 3000/3001 và Chrome CDP riêng trên loopback 9229; không chạy cho production. Axe chỉ là một phần đánh giá, không chứng nhận WCAG hoặc thay thế VoiceOver/Safari và kiểm tra tương phản thủ công.

## Performance 06.5
HRM hiện tải component theo nhu cầu bằng `next/dynamic`; có thông báo chờ. Không làm thay đổi URL/API hoặc giả dữ liệu. Giữ bề mặt kính chính và fallback khả dụng; metric card lặp không blur. Hướng dẫn ảnh/video tương lai tại `MEDIA-PERFORMANCE.md`; chưa có provider thực.

### Visual review 06.6.2
Snapshot candidate ở `tests/visual/candidates` tách biệt snapshot cũ ở `tests/visual/baselines`. Không tự duyệt hoặc cập nhật baseline khi regression thất bại; review thủ công từng viewport/theme và lưu bằng chứng. Playwright 1.65.1 cài Chromium revision 1255, workflow manual so sánh không ghi ảnh chuẩn và lưu diff khi lỗi. Dropdown dùng nền token đặc để bảo đảm chữ phía sau không xuyên qua; Admin dark giảm cường độ ambient, header tablet giữ một hàng. Mới xem lại 6 trong 34 candidate mới; Safari, VoiceOver và tương phản thủ công chưa xác minh. Lệnh tái lập và giới hạn xem `PROGRESS.md`.

Cập nhật: đã xem 15/34 ảnh mới; HRM dark có thẻ giới thiệu mất nội dung trong screenshot, chưa được duyệt và cần điều tra.

### 06.6.3: HRM dark image evidence
Đính chính cảnh báo trước: DOM/CSS cho thấy chữ hiển thị và so sánh pixel của crop PNG desktop light/dark cho cùng 2304 pixel sáng trong vùng chữ; cùng một PNG hash có lúc preview không đầy đủ. Chưa xác định lỗi nội bộ preview, không có bằng chứng cần thay CSS. Kiểm tra nội dung semantic trong Playwright bổ sung, không thay cho contrast/pixel testing. Candidate `candidates-0663` tách riêng, chưa approved; default baseline test còn 5 failure. Xem PROGRESS và ADR 0003.

### 06.6.4 — baseline local reviewed
Đã review các trạng thái 34 candidate, giải thích năm diff cũ bằng ba thay đổi chủ đích (ambient dark, header tablet, nền dropdown), lưu bộ cũ và diff tại `tests/visual/history/pre-0664` cùng SHA-256. `npm run test:visual` so baseline mới pass 12/12 trên macOS local; GitHub Actions và tính tương đương font/OS chưa xác minh. HRM dark tablet/mobile còn cần viewer độc lập vì preview từng không ổn định. Không coi ảnh chuẩn local là xác nhận WCAG hay CI pass. Xem `PROGRESS.md`.

### 06.7 — Safari và accessibility smoke
Safari 18.6/macOS 15.6 đã mở hai ứng dụng, thao tác dialog/dropdown/theme và xác minh sau click/Escape focus trả nút mở; sửa trigger vì Safari không focus nút chỉ từ click. `node scripts/frontend-a11y-matrix.mjs` kiểm tra overflow/theme ở 7 viewport và media fallback giả lập Chromium; glass browser test kiểm tra keyboard/axe/forced colors. Chưa kiểm thử VoiceOver, Safari responsive đầy đủ, OS reduced transparency và contrast thủ công; không suy ra đạt WCAG AA. Xem PROGRESS để tái lập.

### 06.8 — contrast evidence
`CONTRAST-AUDIT-06.8.md` lưu mẫu nền render và tỷ lệ light/dark; bảy mẫu light dưới 4.5:1 chưa sửa. Một mẫu trên gradient không đủ chứng nhận WCAG hoặc non-text/focus. VoiceOver chưa có speech evidence; Safari deep bị gián đoạn. Mọi thay đổi token cần đo lại cả hai app và review visual baseline theo ADR.

### 06.9 — contrast và i18n
Token light `--aurum-muted`/`--aurum-gold` đậm hơn; 22 mẫu trong contrast audit pass sau đo lại một điểm, không khẳng định WCAG hay đầy đủ nền. Visual 12/12 pass với threshold hiện tại, baseline không cập nhật; review màu khi làm UI tiếp. Chỉ có i18n library nền, chưa có switcher hay UI song ngữ; xem PROGRESS và multilingual standard.

### 06.10 — switcher thử nghiệm
Storefront dùng select locale chung với bề mặt token glass và focus ring; mobile header đặt navigation hàng riêng để tránh cắt theme/switcher. Kiểm tra bounds 375/390/768/1440 pass, chưa có bằng chứng chọn native select bằng keyboard hoặc Safari/VoiceOver. 4 visual Product diff chưa review, baseline giữ nguyên; xem PROGRESS.

### 06.10.1 — storefront review
Đã xem bốn bộ Product expected/actual/diff; switcher và navigation hàng thứ hai làm thay đổi layout có chủ đích. Tablet điều chỉnh gap và ẩn label thị giác nhưng giữ tên select; browser rect check 768/1024/390/375 vi/en không chồng lấn. Baseline chưa cập nhật, visual còn 4 fail; native select keyboard/Safari chưa xác minh. Xem PROGRESS.

### 06.10.2 — Admin locale
Admin dùng switcher chung vi/en; header mobile wrap sau khi test phát hiện cắt tại 390px. Browser smoke header bounds 375/390/768/1440 pass trước thay đổi notice cuối; visual 4 pass/8 fail, baseline chưa cập nhật. Native select keyboard, Safari và VoiceOver chưa xác minh; xem PROGRESS.

## Làm rõ dữ liệu DEMO theo governance v3.0
Điều cấm dữ liệu giả ở trên cấm UI mock hoặc trình bày số liệu DEMO như REAL; dữ liệu DEMO được provision có kiểm soát, đánh dấu rõ và đọc qua API đã xác thực/phân quyền theo [REAL-DATA-GOVERNANCE](../database/REAL-DATA-GOVERNANCE.md) được phép khi môi trường và quyền ghi cho phép. Không mô phỏng thanh toán thành công hoặc chức năng chưa kết nối.
