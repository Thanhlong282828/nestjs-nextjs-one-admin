# Audit contrast — Batch 06.8 (2026-11-27)

Chromium headless, production local, viewport 1440×1000, device scale 1. Lệnh: `node scripts/contrast-audit.mjs`, sau khi chạy Admin tại 3190 và Product tại 3101. Script lấy foreground CSS và một pixel nền thực tế ở tâm phần tử sau khi làm trong chữ chỉ trong phiên chụp, tính WCAG relative luminance. Đây là đánh giá mẫu, không phải kiểm toán toàn phần: gradient, blur, opacity, anti-aliasing, vùng nền khác, con cháu màu riêng, trạng thái hover/focus và viewport khác cần đo thêm. “PASS” chỉ áp dụng mẫu này; không chứng nhận WCAG.

| Component | Theme | Foreground RGB | Nền RGB (một điểm) | Tỷ lệ | Mục tiêu | Kết quả |
|---|---|---|---|---:|---:|---|
| Admin heading | light | 48, 45, 41 | 238, 234, 226 | 11.42:1 | 3:1 | PASS |
| Admin intro | light | 119, 114, 107 | 238, 234, 226 | 3.97:1 | 4.5:1 | FAIL |
| Admin eyebrow | light | 169, 129, 49 | 238, 234, 226 | 2.98:1 | 4.5:1 | FAIL |
| Metric label | light | 119, 114, 107 | 249, 246, 240 | 4.42:1 | 4.5:1 | FAIL |
| Metric caption | light | 119, 114, 107 | 249, 246, 240 | 4.42:1 | 4.5:1 | FAIL |
| Navigation label | light | 48, 45, 41 | 243, 235, 219 | 11.56:1 | 4.5:1 | PASS |
| Status title | light | 48, 45, 41 | 234, 227, 210 | 10.71:1 | 4.5:1 | PASS |
| Product heading | light | 48, 45, 41 | 238, 234, 226 | 11.42:1 | 3:1 | PASS |
| Product intro | light | 119, 114, 107 | 238, 234, 226 | 3.97:1 | 4.5:1 | FAIL |
| Product eyebrow | light | 169, 129, 49 | 238, 234, 226 | 2.98:1 | 4.5:1 | FAIL |
| Product navigation | light | 119, 114, 107 | 237, 230, 216 | 3.84:1 | 4.5:1 | FAIL |
| Admin heading | dark | 244, 238, 226 | 27, 26, 24 | 15.05:1 | 3:1 | PASS |
| Admin intro | dark | 184, 171, 150 | 27, 26, 24 | 7.7:1 | 4.5:1 | PASS |
| Admin eyebrow | dark | 226, 194, 118 | 27, 26, 24 | 10.11:1 | 4.5:1 | PASS |
| Metric label | dark | 184, 171, 150 | 38, 36, 34 | 6.85:1 | 4.5:1 | PASS |
| Metric caption | dark | 184, 171, 150 | 38, 36, 34 | 6.85:1 | 4.5:1 | PASS |
| Navigation label | dark | 244, 238, 226 | 64, 58, 44 | 9.77:1 | 4.5:1 | PASS |
| Status title | dark | 244, 238, 226 | 51, 46, 34 | 11.69:1 | 4.5:1 | PASS |
| Product heading | dark | 244, 238, 226 | 27, 26, 24 | 15.05:1 | 3:1 | PASS |
| Product intro | dark | 184, 171, 150 | 27, 26, 24 | 7.7:1 | 4.5:1 | PASS |
| Product eyebrow | dark | 226, 194, 118 | 27, 26, 24 | 10.11:1 | 4.5:1 | PASS |
| Product navigation | dark | 184, 171, 150 | 68, 64, 54 | 4.58:1 | 4.5:1 | PASS |

Bảy mẫu light dưới 4.5:1 cần chỉnh và đo lại trên các nền thực tế. Giá trị không phản ánh toàn bộ trạng thái. Chưa đo contrast biểu tượng, đường viền điều khiển hoặc focus ring (mục tiêu non-text 3:1), focus-not-obscured, target size toàn bộ, biểu đồ/bảng populated; các phần này chưa được xác minh.

## Đo lại Batch 06.9 — 2026-11-27

Sau khi chỉnh hai token light `--aurum-muted` và `--aurum-gold`; cùng phương pháp mẫu một điểm nêu trên, Chromium local production 1440×1000. Không suy ra WCAG toàn hệ thống. Lệnh: `node scripts/contrast-audit.mjs`.

| Thành phần | Theme | Tỷ lệ sau | Mục tiêu | Kết quả mẫu |
|---|---|---:|---:|---|
| Admin heading | light | 11.42:1 | 3:1 | PASS |
| Admin intro | light | 5.26:1 | 4.5:1 | PASS |
| Admin eyebrow | light | 5.1:1 | 4.5:1 | PASS |
| Metric label | light | 5.85:1 | 4.5:1 | PASS |
| Metric caption | light | 5.85:1 | 4.5:1 | PASS |
| Navigation label | light | 11.56:1 | 4.5:1 | PASS |
| Status title | light | 10.71:1 | 4.5:1 | PASS |
| Product heading | light | 11.42:1 | 3:1 | PASS |
| Product intro | light | 5.26:1 | 4.5:1 | PASS |
| Product eyebrow | light | 5.1:1 | 4.5:1 | PASS |
| Product navigation | light | 5.08:1 | 4.5:1 | PASS |
| Admin heading | dark | 15.05:1 | 3:1 | PASS |
| Admin intro | dark | 7.7:1 | 4.5:1 | PASS |
| Admin eyebrow | dark | 10.11:1 | 4.5:1 | PASS |
| Metric label | dark | 6.85:1 | 4.5:1 | PASS |
| Metric caption | dark | 6.85:1 | 4.5:1 | PASS |
| Navigation label | dark | 9.77:1 | 4.5:1 | PASS |
| Status title | dark | 11.69:1 | 4.5:1 | PASS |
| Product heading | dark | 15.05:1 | 3:1 | PASS |
| Product intro | dark | 7.7:1 | 4.5:1 | PASS |
| Product eyebrow | dark | 10.11:1 | 4.5:1 | PASS |
| Product navigation | dark | 4.58:1 | 4.5:1 | PASS |

Bảy mẫu light từng fail hiện pass tại điểm lấy mẫu; chưa xác minh toàn gradient, trạng thái hover/focus, non-text, Safari và VoiceOver.
