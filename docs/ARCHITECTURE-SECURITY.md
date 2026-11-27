> **Chính sách hiện hành v3.0:** [REAL-DATA-GOVERNANCE](database/REAL-DATA-GOVERNANCE.md) ưu tiên đối với phân loại REAL/DEMO và phê duyệt ghi production; mô tả trạng thái các đoạn bên dưới mang tính lịch sử và phải đối chiếu checkpoint mới nhất. Hai tenant production là mục tiêu, chưa được chứng minh tồn tại hay an toàn.

# Kiến trúc và kế hoạch an ninh

## Ranh giới triển khai

Dự án hiện là bản demo, không xử lý dữ liệu thật. Ưu tiên HRM trước CRM/POS. Kiến trúc mục tiêu là modular monolith: module sở hữu controller (HTTP/MVC), application command/query (CQRS khi có nghiệp vụ), domain và infrastructure; Next.js đảm nhiệm view. Không dùng CQRS hoặc phân tán chỉ vì có thể; read/write có thể dùng chung PostgreSQL ban đầu. Module health đã tách controller/service/module, chưa phải triển khai CQRS/HRM backend.

Mỗi bản ghi nghiệp vụ phải thuộc company; mọi truy vấn và thay đổi phải áp tenant scope từ session đã xác thực, không từ ID tùy ý trên client. Chính sách quyền kiểm tra phía server ở cả command và query; kiểm thử cross-company, ownership và role. Audit các thay đổi nhạy cảm, tránh lưu token, mật khẩu, thông tin cá nhân thừa. Migrations và backup/restore test trước production.

## Nguyên tắc an ninh

- Không thể ẩn dữ liệu đã gửi tới trình duyệt khỏi DevTools. Chỉ trả dữ liệu đã được cấp quyền và tối thiểu hóa trường; che dữ liệu nhạy cảm ở server. Không coi che giao diện, tắt chuột phải hoặc obfuscation là bảo mật.
- Helmet ở API, một số security headers ở admin và `Cache-Control: no-store` cho health đã có. Cần CSP với nonce, HTTPS/HSTS tại edge sau khi kiểm thử, an toàn cookie HttpOnly/Secure/SameSite, CSRF, rate limiting, validation, request size limits và đăng nhập/MFA phù hợp trước khi có người dùng thật.
- Mật khẩu `12345678` chỉ seed local, phải chặn production; hiện chưa có seed hoặc đăng nhập. Không lưu mật khẩu rõ; sử dụng thuật toán hash mật khẩu phù hợp và chính sách khôi phục an toàn.
- DDoS thể tích cần CDN/WAF/nhà cung cấp hạ tầng. Cần thiết kế ngưỡng, chống false positive, giám sát và runbook trước khi tự động bật challenge/under attack mode; không hứa một ứng dụng Node tự chống được DDoS. Không kích hoạt tự động khi chưa có nhà cung cấp, credentials, ngưỡng và kịch bản rollback.
- Webhook tương lai: ký HMAC, xác thực chữ ký với so sánh thời gian hằng, timestamp/replay window, idempotency, queue/retry có giới hạn, secret rotation, outbound URL allowlist/chống SSRF và audit; không triển khai endpoint chưa bảo vệ.
- CI hiện gồm typecheck, một test health, build, npm audit production, CodeQL. Bổ sung lint type-aware, kiểm thử authorization và integration, dependency/secret scanning, pin action SHA, SAST và DAST có kiểm soát. CodeQL/branch protection phải kiểm tra trạng thái thật trên GitHub.

## Cache và hiệu năng VPS

Đo latency p50/p95/p99, throughput, lỗi, CPU/memory và DB trước tối ưu; giới hạn connection pool, index theo query thực tế, pagination và giám sát slow query. Cache key tương lai phải có namespace, phiên bản schema, company và phạm vi quyền (ví dụ `hrm:v1:company:<id>:...`), TTL theo độ nhạy dữ liệu, invalidation sau commit và cơ chế chống cache stampede. Không cache dữ liệu nhạy cảm ở shared cache nếu chưa chứng minh cô lập; version cache không thay thế authorization. Hiện chưa có Redis, version cache hay benchmark; không tuyên bố đã giảm latency.

## Monitoring / vận hành

Endpoint `/health` chỉ đo liveness; `/health/ready` kiểm tra kết nối PostgreSQL với timeout, chưa kiểm tra schema hoặc job. Cần bảo vệ endpoint khi triển khai, thêm metrics và tracing có kiểm soát, dashboard và cảnh báo CPU, disk, memory, latency, lỗi, DB, queue lag, dead-letter, retry và heartbeat từng job. Giới hạn truy cập endpoint vận hành, không đưa secret/PII vào logs, thiết lập retention, backup và kiểm thử khôi phục. Chưa có monitoring VPS, job worker hay under attack mode.

## Quy ước bắt buộc cho module nghiệp vụ mới

Mỗi module nghiệp vụ được đóng gói như một workspace library với public API, Nest module và các lớp `presentation` (controller/DTO), `application` (command, query, handlers và ports), `domain` (model/quy tắc) và `infrastructure` (adapter/repository). Next.js cung cấp view. Controller gọi command/query bus hoặc application facade; handler thực hiện use case và gọi domain/ports; adapter không bị import trực tiếp từ module nghiệp vụ khác. Cách bố trí cụ thể có thể điều chỉnh khi implementation chứng minh cần thiết, nhưng ranh giới phải được kiểm tra. Module health hiện chỉ là Nest module nội bộ và chưa đáp ứng mô hình package/CQRS này; chuyển đổi khi phát triển nền tảng HRM, không coi là đã hoàn thành.

## Company và chi nhánh

Mô hình mục tiêu: một company có nhiều chi nhánh, mỗi chi nhánh thuộc đúng một company; user có membership và quyền theo company hoặc tập chi nhánh cụ thể. Phạm vi do session và policy phía server xác định; lựa chọn chi nhánh ở giao diện chỉ là bộ lọc trong phạm vi đã cấp. Với nhân sự, cần xác định phân công chi nhánh, lịch sử chuyển chi nhánh, quyền xem chéo, tổ chức/phòng ban và tác động tới audit trước khi chốt migration. Đề xuất khóa ngoại ghép `(company_id, branch_id)` để database không cho liên kết nhầm công ty; mọi query, cache key, báo cáo, job và webhook phải giữ scope. Cần kiểm thử cross-company, cross-branch, quyền toàn công ty, chuyển chi nhánh, và thay đổi quyền khi session/cache còn hiệu lực. Chưa có bảng company/branch, membership hoặc enforcement ở database/API. `Actor` HRM hiện chỉ có company, chưa có branch; không coi đó là tenant isolation hoàn chỉnh.

## Nền tảng identity và company, checkpoint 2026-11-25

`@aurum/access` cung cấp policy thuần kiểm tra trạng thái principal, permission tường minh, company và branch, không cho system admin bypass ngầm. Dữ liệu principal, membership, permission và branch phải được lấy từ nguồn server đáng tin; policy không tự xác thực hay truy cập database, không được nối vào endpoint với input từ client. Chưa có permission store, session, cache hay cơ chế thu hồi session.

Prisma schema đề xuất `identity_users`, `branches`, `company_memberships`, `branch_grants`. Khóa ngoại ghép đảm bảo branch grant phải cùng company với membership. Migration mới mới được áp trên database test; chưa áp database ứng dụng. User/passwordHash là cấu trúc dự kiến; `@aurum/identity` có hàm hash/verify Argon2id độc lập, chưa tích hợp tài khoản và không được dùng làm đăng nhập. Chuỗi trạng thái chưa có DB check constraint, chưa có RLS (MySQL); phải bổ sung kiểm tra server-side và ràng buộc trong batch tiếp theo.

Migration là DDL bổ sung bảng, không xóa bảng hiện hữu nhưng MySQL DDL có thể implicit commit/khóa metadata. Trước production: backup/restore test, kiểm tra tên bảng/trạng thái/schema, unique/FK trên dữ liệu thực, khả năng rollback (ưu tiên forward migration và backup, không tự động DROP), quyền user app hạn chế, và test fresh + upgrade trên DB tách biệt. Test hiện mới chứng minh đường upgrade trên `aurum_nestjs_test`, chưa chứng minh fresh/production.

Argon2id trong `@aurum/identity` dùng 19 MiB, 2 vòng, 1 luồng theo [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), test salt/hash/verify độc lập; cần benchmark và giới hạn login concurrent/rate limit trước khi triển khai. Không có luồng seed password local.

## Checkpoint nền tảng session 2026-11-25

`SessionService` tạo token opaque ngẫu nhiên 32 byte, chỉ lưu SHA-256 của token, kiểm tra thời hạn, thu hồi và trạng thái user hiện tại. Prisma adapter thực hiện thu hồi theo cả session ID và user ID; migration session chỉ áp vào MySQL test. Adapter chưa được lắp vào Nest module hay endpoint: các mô tả trước về thiếu session có thể hiểu là thiếu session hoạt động qua API. Xem `AUTHENTICATION.md` để biết giới hạn, đặc biệt việc caller phải xác thực và bảo vệ CSRF/rate limit trước khi phát hành session. Không mở API nghiệp vụ cho tới khi identity, quyền và tenant scope được thực thi phía server.

## Batch 03 — company list và quyền demo

Query danh sách kiểm tra `company.read` cho từng membership, từ chối membership trùng/không hợp lệ theo policy và chuyển các company ID được phép vào Prisma WHERE trước count/pagination. Principal phải do server xác thực tải từ database; adapter và query chưa được công khai qua HTTP. Tìm kiếm có giới hạn và dùng Prisma parameterized query. Danh sách và tổng số hiện chạy hai truy vấn riêng, chưa bảo đảm snapshot nhất quán khi có ghi đồng thời; cần đánh giá transaction/isolation nếu nghiệp vụ đòi hỏi. App user demo chỉ còn SELECT trên companies; quyền mới cho login phải được thiết kế riêng, không cấp SELECT toàn schema.

Batch 05: đổi password nội bộ dùng Argon2id, compare-and-set hash cũ phân biệt hoa thường trong MySQL, điều kiện session active và revoke cùng transaction serializable. Chưa đưa vào API; cần kiểm thử concurrency, lỗi rollback, policy audit, CSRF/origin và rate limit trước khi cung cấp. Đã chạy lại audit dependency: ba high Prisma/effect chưa được giải quyết.

Batch 05 continuation: `npm audit` thực tế còn 3 high effect; thử cài sạch override effect 3.22.5 trong bản metadata tạm có audit 0 nhưng chưa kiểm chứng tương thích runtime và chưa triển khai vào checkout. Không hạ/suppress gate. Query identity/session vẫn là thư viện nội bộ, cần guard, cookie, CSRF, rate limit, audit và kiểm thử race trước khi mở HTTP.

Batch 05 continuation 02: override giới hạn `@prisma/config` sử dụng `effect@3.22.5` đã được áp dụng sau npm ci/typecheck/build/test MySQL trên bản sao; npm audit toàn bộ và production báo 0 tại thời điểm kiểm tra. Prisma vẫn 7.10.1 và việc override vượt pin upstream cần theo dõi; test PostgreSQL legacy, E2E và CI còn thiếu. Việc hết finding dependency không thay thế security review. Credential verifier và revoke session chưa đăng ký endpoint; thiếu limiter, audit, CSRF và kiểm thử đồng thời.

CP1.2: ghi success cùng session trong transaction serializable có khóa user và kiểm tra hash/status; failure event không chứa email hoặc secrets. Tạm thời chưa audit logout/password change/revoke, chưa rate limit và chưa có retention/anti-flood, nên không mở endpoint. MySQL audit migration chỉ được áp database test. npm ci Node 24/npm 11 hoàn tất nhưng npm ls báo override effect không hợp lệ; npm audit sạch không loại bỏ vấn đề compatibility này.

CP1.2.1 dùng Node 24.13.1/npm 10.9.4 pin trong dự án/CI sau khi npm11.8 báo invalid với override effect; Node24/npm10 clean install/ls/audit pass, không khẳng định lỗi npm11 đã sửa. `IdentityModule` chỉ là internal composition, không import AppModule; cần kiểm tra ESM/CJS bootstrap, race và cookie/CSRF/rate limit trước HTTP. Session rotation giới hạn user; audit logout/revoke/password change được ghi cùng transaction khi dùng audited adapter.

CP1.2.2 bổ sung integration tests MySQL cho một số race và rollback password audit, và Nest runtime test lắng nghe loopback với auth route 404; không phải bằng chứng security tổng thể hay browser E2E. ESLint 9.39.5 hiện bị npm đánh dấu hết hỗ trợ; ESLint 10 có xung đột peer dependency trong lần thử, không dùng force. Dùng trong development/CI, audit hiện không báo vulnerability; cần nâng khi Next plugin hỗ trợ, theo dõi advisory. Audit hiện chưa bất biến hoặc chống sửa/xóa, cần thiết kế quyền DB, retention và tamper-evidence.

## TypeScript-first v1.0
[TypeScript standard](architecture/TYPESCRIPT-STANDARD.md) là luật bắt buộc; schema/type system không thay thế xác thực input, authentication, authorization, tenant isolation hay kiểm soát tiền/ngày. Gate `npm run test:typescript-policy` kiểm tra đường dẫn và allowlist, không kiểm chứng bảo mật hay semantic import; CI chạy gate nhưng kết quả GitHub thực tế chưa được xác minh. Database production owner policy v3.0 và connected data governance không thay đổi.

### Batch 07.7.2.5 — test-only privilege review
Runtime and migration principals are separated in restricted-principal HTTP and HRM browser tests. `identity_users` uses SELECT-only and login takes a shared locking read; classification/provenance are SELECT-only. The complete test grant matrix and direct-SQL limitations are documented in `docs/database/DATABASE-GOVERNANCE.md`. No claim of classification-aware tenant authorization or production readiness follows from those grants.

### Batch 07.7.2.6 classification boundary
HRM read and employee mutation transactions check persisted classification and explicit tenant track permissions together with current session, membership, branch grant and resource permission. Company and branch lists filter unclassified or unauthorized scope. This is not evidence of complete track isolation for caches, jobs, audit exports or reports; do not enable those without server-derived track context and negative isolation tests.
