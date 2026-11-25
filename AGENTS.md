# Luật phát triển Aurum ERP

- Đọc `docs/PROGRESS.md` và README trước khi làm; cập nhật tiến độ và giới hạn sau mỗi thay đổi.
- Không tuyên bố chức năng, bảo mật, dữ liệu thật hay kiểm thử đã hoàn thành nếu chưa kiểm chứng. Phân biệt demo với production.
- Mặc định TypeScript strict; xác thực dữ liệu đầu vào tại ranh giới; không dùng `any` để né kiểm tra; code theo module nghiệp vụ.
- Mọi tính năng có dữ liệu riêng tư phải có xác thực, phân quyền phía server và ranh giới tenant trước khi công khai; không tin dữ liệu hoặc quyền từ client.
- Không commit bí mật, mật khẩu thật hay dữ liệu khách hàng. Tài khoản `12345678` chỉ được dùng seed local rõ ràng, không triển khai ra môi trường thật; hiện chưa có chức năng đăng nhập.
- Thay đổi database dùng migration có thể kiểm tra, không xóa volume hoặc dữ liệu người dùng. Kiểm thử trên database riêng.
- Khi thêm nghiệp vụ, bổ sung kiểm thử hành vi, quyền truy cập và trường hợp thất bại; chạy typecheck, test, build và security audit phù hợp. Không bỏ qua lỗi CI để đạt trạng thái xanh.
- Ưu tiên accessibility, bàn phím, responsive, trạng thái loading/empty/error; ghi rõ các nút chưa có nghiệp vụ.
- Tránh thêm công nghệ chỉ để đủ danh sách; ghi quyết định và trade-off khi cần. Không chạy migration phá hủy, deploy hoặc push nếu chưa hiểu tác động.
- Ưu tiên hoàn thiện HRM trước CRM/POS. Áp dụng kiến trúc module + MVC với CQRS ở lớp application khi có use case phù hợp; không nhận nhầm cấu trúc thư mục với nghiệp vụ đã hoàn thành.
- Mọi thay đổi liên quan dữ liệu, cache, webhook và bảo mật phải tuân theo `docs/ARCHITECTURE-SECURITY.md`. Không giả vờ ẩn dữ liệu khỏi DevTools hoặc quảng cáo khả năng chống DDoS khi chưa có edge/WAF và kiểm chứng.
- Override `effect` trong `@prisma/config` là bản vá dependency tạm thời: giữ package và lockfile đồng bộ, kiểm tra `npm ci`, audit và test khi thay đổi; theo dõi bản Prisma upstream tương thích để loại override. Không xem audit dependency sạch là chứng nhận toàn bộ bảo mật.
- Công cụ dự án: Node 24.13.1 (`.nvmrc`) và npm 10.9.4 (`packageManager`), tương ứng CI; không tự ý đổi npm major khi chưa kiểm tra workspace override và clean install.
- Không mở authentication endpoint khi chưa có cookie/CSRF, giới hạn tốc độ, session guard, audit và kiểm thử âm tính. Không ghi password, token, cookie hoặc session hash vào audit/log. Migration authentication phải thử trên database test riêng trước khi đánh giá backup/rollout của database ứng dụng.
- Chạy `npm run lint`, `npm run test:architecture`, typecheck, test và build phù hợp; không bỏ qua lỗi để CI xanh. Architecture checker hiện chỉ kiểm tra import tĩnh trong backend/library và không thay thế review dynamic imports, authorization hay audit security. Theo dõi nâng ESLint khi dependency Next hỗ trợ phiên bản mới được duy trì.

## Kiến trúc bắt buộc: module (thư viện) + CQRS + MVC

- Mỗi miền nghiệp vụ là một thư viện/package workspace riêng, có public API và ranh giới phụ thuộc rõ ràng; Nest application chỉ lắp ráp các module. Không import xuyên qua internals của package khác. Tách package dùng chung chỉ khi có nhu cầu thực tế.
- MVC tại ranh giới: controller nhận request, xác thực/ủy quyền và điều phối; model/domain giữ quy tắc và trạng thái nghiệp vụ; view do Next.js đảm nhiệm. Controller không chứa nghiệp vụ hoặc truy vấn database trực tiếp.
- CQRS ở application layer: thao tác ghi đi qua command + command handler; thao tác đọc đi qua query + query handler. Handler gọi domain và port/repository; infrastructure triển khai port. Không bắt buộc event sourcing, microservice hay database đọc riêng.
- Mỗi use case có kiểm thử hành vi và kiểm thử authorization/cách ly company phù hợp. Thiết kế và tài liệu phải phân biệt kiến trúc mục tiêu với những gì đã triển khai; hoàn thiện HRM trước CRM/POS.
- Company và chi nhánh là khái niệm bắt buộc: chi nhánh thuộc đúng một company; dữ liệu và quyền nghiệp vụ phải được scope theo company và các chi nhánh được cấp quyền, kể cả báo cáo, cache, job và webhook. Không tin company/branch ID hoặc phạm vi quyền do client tự gửi. Mọi thao tác xuyên company/chi nhánh phải bị từ chối trừ khi có quyền server hợp lệ; kiểm thử trường hợp âm tính trước khi mở API.
- Media: ảnh hướng tới Cloudflare Images; tài liệu hướng tới Supabase Storage S3 private; không fallback âm thầm giữa provider. File phải được kiểm tra kích thước/loại và quét malware fail-closed trước khi lưu; scope company/branch và quyền phải được xác thực server-side. Không công bố upload thật cho đến khi adapter, scanner, phân quyền và kiểm thử end-to-end sẵn sàng.
- Dữ liệu nghiệp vụ phải được lưu thật trong database môi trường tương ứng qua NestJS/Prisma; mỗi chức năng cần schema, migration, validation, authorization và kiểm thử phù hợp. Không hard-code KPI, biểu đồ hay giả lập CRUD đã hoàn thành.
- Được chủ động chạy seed có đánh dấu `[DEMO]` trong database development **local** `aurum_nestjs` để xem giao diện; có thể dùng database demo riêng, nhưng không dùng database test làm nguồn UI. Không seed dữ liệu demo vào production. Không đưa dữ liệu khách hàng thật vào seed hoặc commit. Seed phải idempotent, không ghi đè/xóa bản ghi khác và kiểm tra xung đột; mô-đun chưa có schema không được giả là đã seed.
- Trước mọi lệnh ghi/migration: xác minh environment, DATABASE_URL, host, port, database, user, quyền và database thực sau kết nối; từ chối production và đích không rõ. Không tự động DROP/TRUNCATE, migration reset hay xóa dữ liệu. Thao tác phá hủy cần xác nhận riêng. Không dùng superuser cho app hoặc lộ credentials ra frontend. Chi tiết `docs/database/DATABASE-GOVERNANCE.md`, `DATABASE-SEEDING.md`, `DATABASE-ENVIRONMENTS.md`.
- Giao diện lấy dữ liệu từ database qua NestJS API với xác thực và phân quyền phù hợp; không hard-code số liệu nghiệp vụ trong frontend. Khi API chưa sẵn sàng, hiển thị trạng thái chưa khả dụng, không giả định là số 0. Test fixtures vẫn dùng database test riêng và không lẫn với dữ liệu demo.
- Theo yêu cầu hiện tại, database ứng dụng Aurum là MySQL local, truy cập qua NestJS + Prisma; `pma.test` chỉ là giao diện phpMyAdmin. Không chạm hoặc xóa database PostgreSQL và Laravel cũ; lịch sử PostgreSQL trong repository vẫn chỉ để tham khảo/test legacy.
