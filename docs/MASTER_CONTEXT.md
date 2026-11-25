# Aurum ERP — bối cảnh phiên tiếp theo

Aurum là monorepo npm gồm NestJS API, Next.js admin và Next.js khách; ưu tiên HRM, giao diện vàng và dữ liệu thật. Kiến trúc yêu cầu module dưới dạng workspace library, CQRS và MVC, policy phía server và company/branch isolation. Đọc `AGENTS.md`, `README.md`, `PROGRESS.md`, `ARCHITECTURE-SECURITY.md`, `IMPLEMENTATION_HANDOFF.md` trước khi thay đổi.

**Yêu cầu dữ liệu mới nhất:** người dùng cho phép dữ liệu mẫu có đánh dấu trong database demo/phát triển tách biệt để xem giao diện. Xem luật seed an toàn tại `AGENTS.md`; chưa có database demo hoặc dữ liệu demo được tạo ở checkpoint này.

Theo xác nhận của người dùng, `nestjsnextjsonekhach` / `apps/khach` là ứng dụng sản phẩm cho khách hàng, còn `nestjsnextjsoneadmin` / `apps/admin` là hệ thống quản trị. Không xem ứng dụng khách chỉ là landing page: trang giới thiệu hiện tại là phần khởi đầu, chưa phải sản phẩm hoàn chỉnh.

Hiện ứng dụng NestJS dùng Prisma MySQL local `aurum_nestjs`; Postgres và Laravel cũ được giữ nguyên. `.env.mysql` là cấu hình local không commit. Admin hiện không có dữ liệu giả; chỉ có trạng thái chưa kết nối. API chỉ có health/readiness; chưa có đăng nhập, session hoạt động qua API, API HRM hoặc phân quyền thực thi. Khách chỉ có trang giới thiệu.

`@aurum/access` là policy thuần đã test, chưa tích hợp API; `@aurum/identity` có Argon2id và nền tảng session đã test nhưng chưa tích hợp tài khoản hay API; `@aurum/hrm` là package PostgreSQL cũ chưa nối API; `@aurum/media` mới có contracts/kiểm thử mock, chưa có ClamAV hay cloud thật. Prisma schema có dự thảo identity/company/branch/session; migration tương ứng chỉ áp trên database test, không có user hoặc dữ liệu nghiệp vụ seed. Xem `AUTHENTICATION.md` và checkpoint mới nhất trong `PROGRESS.md`.

Không nói production-ready. npm audit đang báo 3 high trong chuỗi Prisma/effect; không bỏ qua CI. Thông tin kỹ thuật và hướng dẫn vận hành tại `MYSQL-SETUP.md`, `LARAVELDJI-REFERENCE.md`, `MEDIA-STORAGE.md` và handoff.

**Phân định mới nhất:** `apps/khach` là trang bán hàng cho người mua, không phải trang quảng cáo hệ thống quản trị; `apps/admin` là hệ thống quản trị. Trang bán hàng hiện chưa kết nối danh mục sản phẩm hoặc đặt hàng.

**Database demo đã tạo:** `aurum_nestjs_demo` chứa hai company có nhãn DEMO; dữ liệu được lưu thật trong MySQL nhưng chưa kết nối tới dashboard. Xem checkpoint mới nhất trong `PROGRESS.md`.

`@aurum/company` hiện có query đọc công ty với policy và Prisma adapter đã test trên MySQL test; chưa nối Nest endpoint hoặc dashboard. Tiếp tục theo `IMPLEMENTATION_HANDOFF.md`.

Batch 03: công ty demo chưa hiển thị qua API; đã thêm truy vấn danh sách có lọc quyền, tìm kiếm và phân trang, chỉ được kiểm thử nội bộ. `nestjs` hiện chỉ SELECT bảng companies tại database demo, không đọc password hash. Xem checkpoint mới nhất trong `PROGRESS.md`.

Theo lựa chọn của người dùng, database ứng dụng local `aurum_nestjs` nay cũng có hai bản ghi công ty mang nhãn `[DEMO]`; chưa hiển thị qua API hoặc dashboard. Ngoại lệ này không cho phép seed tự động vào production.

Batch 04: `aurum_nestjs` được người dùng xác định là database development local; được seed các bản ghi DEMO có nhãn theo luật mới trong `AGENTS.md`. Đã có lệnh seed company an toàn và lệnh health/status/verify; chỉ hai company, chưa có login/API/dashboard thực. Hướng dẫn và giới hạn tại `docs/database/DATABASE-SEEDING.md`.

Batch 05 mới có command đổi mật khẩu và adapter MySQL kiểm thử nội bộ; chưa có API/login hay thay đổi schema database ứng dụng. Xem `AUTHENTICATION.md` và checkpoint mới nhất trong `IMPLEMENTATION_HANDOFF.md`.

Batch 05 continuation: có query identity/session đã test nội bộ MySQL nhưng chưa có login/API/UI. Audit checkout vẫn fail 3 high Prisma/effect; bản override effect đã thử ở môi trường tạm chưa tích hợp. Xem checkpoint mới nhất trong `IMPLEMENTATION_HANDOFF.md`.

Batch 05 continuation 02: effect đã override 3.22.5, Prisma giữ 7.10.1; npm audit thực tế báo 0 tại thời điểm kiểm tra, xem handoff về giới hạn. Có verifier credentials và revoke-session handler test MySQL nội bộ, chưa có LoginCommand, login API/UI, rate limit hay account bootstrap.

CP1.2: login engine đã test nội bộ với MySQL test, migration audit 005 chỉ test; chưa có endpoint/login UI hoặc đăng ký Nest CQRS. npm 11 báo override effect invalid khi npm ls dù npm ci/audit hoàn tất; xem handoff và chưa coi CP1.2 hoàn thành.

CP1.2.1: dự án/CI pin Node 24.13.1 và npm 10.9.4 để `npm ci`/`npm ls` nhận override effect 3.22.5; npm11.8 vẫn báo invalid. IdentityModule CQRS nội bộ, rotation và audit session/password đã kiểm thử MySQL nhưng chưa import vào AppModule, chưa có endpoint hay UI đăng nhập. Xem checkpoint mới nhất ở `IMPLEMENTATION_HANDOFF.md`.

CP1.2.2: MySQL race/password-audit rollback và Nest HTTP runtime thử nghiệm đã test; auth route vẫn chưa mở. ESLint và architecture gates đã thêm, nhưng ESLint 9 bị npm đánh dấu hết hỗ trợ và thử version 10 gặp peer conflict; Knip còn findings cần review. PG legacy skip, GitHub Actions mới chưa chạy, audit không bảo đảm security tổng thể. Xem handoff.

2026-11-26: hai frontend được push riêng thành snapshot độc lập trên GitHub admin (`84a2a52`) và product (`2d3487f`); Nest API chưa được push trong đợt này. Các bản tách chưa tự đồng bộ với monorepo; xem handoff.
