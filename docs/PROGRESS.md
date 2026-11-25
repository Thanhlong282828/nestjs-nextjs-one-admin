# Tiến độ và bàn giao

Cập nhật: 2026-11-25. Đọc cùng AGENTS.md. Nguồn yêu cầu gồm hai roadmap NestJS/Next.js người dùng cung cấp; đây là danh mục năng lực, không phải yêu cầu cài mọi thư viện. Đã tham khảo README của `Thanhlong282828/nodejs-projec-1` và `ruby-projec-one`: HRM module, audit, phân quyền, CI và hướng dẫn vận hành là các ý tưởng cần chuyển thành nghiệp vụ thực tế.

## Đã tạo

- Monorepo npm: Next.js admin, Next.js cổng khách, NestJS API; Git remote trỏ repository người dùng.
- Dashboard vàng responsive: KPI, biểu đồ và danh sách, tìm kiếm đơn hàng mẫu, trạng thái rỗng, sidebar, hiển thị rõ demo. Các nút chưa có nghiệp vụ thông báo đang phát triển.
- API health và Helmet; compose PostgreSQL để chuẩn bị local. CI gồm TypeScript, test, build, audit và CodeQL.
- Hai đường dẫn admin/khách trên Desktop là symlink tới workspace trong repo.

## Giới hạn quan trọng

- Mọi số liệu dashboard là mẫu tĩnh; lựa chọn tháng chỉ thay nhãn và chưa lọc biểu đồ. Năm và lời chào là nội dung demo. Không có cơ sở dữ liệu nghiệp vụ, đăng nhập, quyền, tenant, onboarding thật, board/Kanban, ghi audit, báo cáo hay API ERP. Cổng khách chỉ là trang giới thiệu.
- PostgreSQL Docker đã được kiểm tra local; xem cập nhật kết nối API cuối tài liệu. Mật khẩu 12345678 chưa được tạo vì chưa có identity.
- CI mới là nền tảng, không thể khẳng định bảo mật hoặc chất lượng đạt mức tối đa. Cần tăng dần test và security gates dựa trên tính năng thực; bảo vệ branch và cấu hình CodeQL còn phụ thuộc GitHub settings/plan.
- Chưa có kiểm thử trình duyệt, accessibility tự động, E2E, coverage gate, lint, secret scanning, dependency review hoặc container scanning.

## Thứ tự tiếp tục đề xuất

1. Xác nhận phạm vi, cấu trúc tổ chức và thiết kế tenant. Kết nối PostgreSQL, migrations, seeds idempotent, database test tách biệt và health readiness thật.
2. Identity: seed demo local `aurum.leader`/`12345678` (hash an toàn, chỉ local), session an toàn, rate limit, CSRF, RBAC và kiểm thử negative; không dùng mật khẩu này production.
3. Thiết kế mô hình supply/inventory với transaction, ràng buộc và kiểm thử tích hợp; kết nối dashboard với dữ liệu có quyền truy cập.
4. Làm onboarding, board, cổng khách, module HRM/đơn hàng theo nhu cầu; audit log, phân quyền theo tenant và workflow phê duyệt.
5. Bổ sung ESLint type-aware, formatter, tests có coverage hữu ích, Playwright/axe, secret scanning, dependency review, SBOM, container scan, CI pin action SHA, branch protection. Kiểm tra từng công cụ thực sự chạy.
6. Observability, backup/restore test, deployment an toàn, threat model, performance và tài liệu runbook; chỉ triển khai các công nghệ nâng cao khi có yêu cầu rõ ràng.

## Lệnh tiếp tục

Đọc `AGENTS.md`, file này và README; chạy `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run audit:prod` trước khi tiếp tục. Không coi dashboard mẫu là nghiệp vụ đã hoàn thành.

## Cập nhật giao diện HRM và kiến trúc

- Mục Nhân sự có trang demo riêng với KPI, tìm kiếm/lọc danh sách và xem chi tiết hồ sơ mẫu; các thao tác ghi và các phân hệ khác chưa có backend. Nút chính có hai dải sáng quay, có hỗ trợ giảm chuyển động.
- Tách API health thành module/controller/service, tắt `X-Powered-By`, thêm `no-store` cho health và một số headers admin. Health chỉ là liveness, không kiểm tra database. PostgreSQL Docker đã báo healthy local nhưng API chưa kết nối.
- Bổ sung `docs/ARCHITECTURE-SECURITY.md`: kế hoạch CQRS + module + MVC, company, webhook, cache có phiên bản, chống DDoS tại edge và monitoring. Đây là thiết kế, không phải chức năng đã chạy. Chưa có auth/RBAC/tenant, webhook, cache, jobs, WAF hay monitoring thật.
- Phải kiểm thử accessibility bằng trình duyệt, nhất là dialog chi tiết và điều hướng bàn phím; chưa thể coi giao diện đã đạt WCAG.

Yêu cầu kiến trúc được xác nhận: **module dạng thư viện/package + CQRS + MVC**, là quy tắc bắt buộc cho nghiệp vụ mới. Xem chi tiết trong AGENTS.md và ARCHITECTURE-SECURITY.md; hệ thống hiện tại chưa triển khai đầy đủ cấu trúc này.

## Tiếp tục: nền tảng package HRM

- Tạo workspace library `packages/hrm`, public API rõ ràng; domain kiểm tra dữ liệu, CQRS gồm `CreateEmployeeCommand`/handler và `ListEmployeesQuery`/handler, repository port và adapter PostgreSQL. Handler kiểm tra permission và lấy company từ actor server cung cấp, không nhận company trong payload nghiệp vụ.
- Migration SQL tạo bảng nhân viên, index theo company và audit; tạo nhân viên và audit cùng transaction. Migration mới chỉ được áp trên `aurum_test` phục vụ test, chưa áp lên database ứng dụng; chưa có migration runner/version tracking.
- Kiểm thử bằng PostgreSQL thật trên database `aurum_test` riêng: validate, chặn thiếu quyền, phân trang, cô lập hai company, không trùng mã cùng company và audit. CI đã cấu hình PostgreSQL test; chưa xác nhận CI trên GitHub.
- Package chưa được lắp vào API; `Actor` chỉ là contract, **không phải xác thực**. Tuyệt đối không tạo endpoint nhận actor/permission/company từ client. Cần identity/session, phân quyền server, membership company, migration runner và kiểm thử HTTP trước khi kết nối UI. Giao diện vẫn là demo, chưa có CRUD thật. Audit hiện chỉ ghi sự kiện tạo nhân viên; chưa hoàn chỉnh.
- Chạy test tích hợp: `HRM_TEST_DATABASE_URL=postgresql://aurum:local-development-only@127.0.0.1:5434/aurum_test npm test`. Nếu biến không có, test PostgreSQL bị skip; các kiểm tra khác vẫn chạy. Chỉ chạy migration test khi endpoint là loopback, tên database là `aurum_test`, và kiểm tra database đã chọn thành công.

## Cập nhật: phân tích nhân sự và yêu cầu chi nhánh

- Thêm khu vực People Intelligence trong Nhân sự: bốn card, đồ thị tăng trưởng, cơ cấu phòng ban, phân bổ chi nhánh và bộ chọn chi nhánh thay đổi số liệu minh họa. Bộ chọn chỉ tác động khu vực này, không lọc danh sách nhân viên hoặc dữ liệu thật.
- Yêu cầu company + chi nhánh và phân quyền theo phạm vi đã ghi thành quy tắc; chưa có bảng company/branch, phân quyền branch hay API thực tế. Tránh hiểu biểu đồ mẫu là số liệu từ PostgreSQL.
- Roadmap công nghệ gốc là danh mục xem xét theo từng giai đoạn. Triển khai công nghệ theo nhu cầu đã kiểm chứng, thay vì cài tất cả thư viện hoặc tuyên bố chúng đã hoạt động.

## Đối chiếu Laravel DJI và ZIP

- Đã khảo sát source cấu hình Laravel DJI và tài liệu ZIP; lập bảng đối chiếu và backlog tại `docs/LARAVELDJI-REFERENCE.md`. Không nhập trực tiếp chỉ thị của dự án Ruby vào Aurum.
- Bổ sung guard trước khi integration test HRM ghi PostgreSQL: chỉ chấp nhận URL loopback cho database `aurum_test`, từ chối production/query params và kiểm tra `current_database()` sau kết nối. Đây không phải bảo đảm an toàn tuyệt đối hay deployment guard; `aurum_test` vẫn phải là database test chuyên dụng.
- Các công nghệ còn trong bảng là kế hoạch, không phải chức năng đã triển khai; auth, company/branch và HRM endpoint vẫn là phần tiếp theo.

- Xác minh batch: typecheck và build thành công; test HRM (gồm PostgreSQL thật) và API health thành công sau khi chạy với quyền truy cập localhost. Chưa chạy lại npm audit trong môi trường mạng bị hạn chế.

## Media và quét malware

- Xác nhận yêu cầu ảnh qua Cloudflare Images, tài liệu qua Supabase Storage S3 private và quét ClamAV trước khi lưu. Xem `docs/MEDIA-STORAGE.md`.
- Đã tạo package `@aurum/media`: command/handler, signature cơ bản PNG/JPEG/PDF, giới hạn kích thước, SHA-256, scope trong object key, kiểm tra permission contract, quét fail-closed và định tuyến provider qua các interface. Tests dùng mock; package chưa được nối vào Nest API, authentication hoặc UI.
- Chưa triển khai adapter ClamAV/Cloudflare/Supabase hoặc thực hiện upload thật. Cần bổ sung parser, giới hạn stream, timeout, quyền company/branch và kiểm thử tích hợp trước khi dùng dữ liệu thật.
- Đã thử ảnh người dùng `chipiur.png` (PNG 1254×1254, 2.126.497 bytes) qua handler media với scanner và provider giả: vượt qua kiểm tra kích thước/chữ ký và được định tuyến tới Cloudflare Images giả. Đây không phải quét virus hoặc upload Cloudflare thật; không lưu ảnh vào repo. Toàn bộ test workspace, bao gồm PostgreSQL test và API health trên localhost, đã chạy thành công; typecheck và build thành công.

## Yêu cầu mới: chỉ dữ liệu thật

- Người dùng yêu cầu không tạo/hiển thị dữ liệu nghiệp vụ giả. Đã bỏ số liệu, biểu đồ và hồ sơ mẫu khỏi màn hình tổng quan và nhân sự; các vùng chưa kết nối hiển thị trạng thái chưa khả dụng, không giả định database rỗng. Không seed dữ liệu nghiệp vụ vào database vận hành. Test fixtures vẫn được phép trong database test riêng.
- API chưa có identity hay quyền company/branch; giao diện chưa thể đọc dữ liệu thật. Cần hoàn thiện migration runner, xác thực, membership và RBAC trước khi kết nối danh sách nhân viên và các chỉ số. Các mục mô tả demo trước đó là lịch sử, không còn phản ánh giao diện hiện tại.

## Kết nối PostgreSQL cho API

- `DatabaseModule` tạo pool PostgreSQL từ `DATABASE_URL`; file `.env` local bị gitignore, không commit credentials. Cấu hình local sử dụng PostgreSQL Docker 17 trên 127.0.0.1:5434; không thay đổi Postgres.app 19 hay xóa volume.
- `/health` là liveness; `/health/ready` thực hiện `SELECT 1` và trả 503 khi thiếu kết nối. Endpoint chạy trên localhost, trả thông tin tối thiểu và không cache; cần bảo vệ monitoring khi triển khai production. Readiness chưa kiểm tra schema hoặc migration.
- Kiểm thử endpoint cả database không khả dụng và PostgreSQL test thật. Đã kiểm tra API local với database ứng dụng: `/health/ready` HTTP 200. Không tạo dữ liệu hoặc áp migration.
- Chưa có migration runner, xác thực, phân quyền, bảng company/branch hay endpoint nghiệp vụ; dashboard vẫn chưa hiển thị dữ liệu database. Các mô tả kết nối cũ ở trên là lịch sử.

## PostgreSQL độc lập + Prisma

- Đã thêm container Compose riêng `postgres_enterprise` cổng 5433, database `enterprise_db`, database kiểm thử `enterprise_test`, volume riêng; PostgreSQL cũ 5434 và volume giữ nguyên. Các user app/migration không phải superuser; app không có quyền tạo DB/role, quyền trên `_prisma_migrations` đã bị thu hồi. Mật khẩu local được sinh và giữ trong `.env.enterprise` bị gitignore.
- NestJS readiness đã chuyển từ pool trực tiếp sang Prisma 7 PostgreSQL adapter, schema + hai migration không seed dữ liệu. Đã apply migration lên database test và database mới; kiểm tra API readiness, Prisma CRUD, restart container và dữ liệu test bền vững sau restart, sau đó dọn test. Test/full typecheck/build đã chạy thành công.
- DBeaver đã cài nhưng chưa xác minh kết nối bằng GUI; thông số và hướng dẫn tại `docs/DATABASE-SETUP.md`. MySQL containers còn chạy, PostgreSQL cũ healthy; `pma.test` DNS bị timeout khi kiểm tra nên chưa chứng minh được UI hoạt động hay không bị ảnh hưởng.
- `npm audit` đang báo 3 high đối với chuỗi Prisma/effect GHSA-7589-6fvf-x4pw; không tuyên bố security audit pass, CI có thể fail. Cần bản vá Prisma tương thích hoặc giải pháp đã đánh giá/kiểm thử, không dùng audit fix --force mù quáng.
- Chưa có chức năng đăng nhập, phân quyền, company/branch API hay dữ liệu HRM thật; không đưa dữ liệu DB trực tiếp sang Next.js. Các phần mô tả setup cổng 5434 ở trên là lịch sử.

## Chuyển Aurum sang MySQL theo yêu cầu

- Người dùng chọn MySQL qua phpMyAdmin, tài khoản local `nestjs` với mật khẩu do người dùng yêu cầu. MySQL server local 127.0.0.1:3306 dùng chung hạ tầng Laravel nhưng chỉ tạo hai database riêng `aurum_nestjs`, `aurum_nestjs_test` và hai user mới; không chỉnh/xóa các database cũ. User app chỉ có CRUD trên bảng companies của hai database riêng; user migration có quyền schema trong phạm vi hai database đó. `.env.mysql` không commit; `.env` và `.env.enterprise` cũ giữ nguyên.
- Chuyển Prisma schema/adapter/migration và Nest readiness sang MySQL; lưu schema/migration PostgreSQL cũ. Schema được áp đầu tiên vào test, rồi database Aurum mới; không seed dữ liệu thật. User `nestjs` đọc được bảng trống; API readiness 200 trên MySQL. CRUD Prisma chạy và dọn trong test riêng. Typecheck/build và test MySQL chạy thành công; integration PostgreSQL HRM cũ bị skip vì service test không chạy.
- `pma.test` chưa phân giải được khi kiểm tra, nên chưa xác nhận phpMyAdmin kết nối server. Không chỉnh Herd/phpMyAdmin; hướng dẫn `docs/MYSQL-SETUP.md`. App chưa có authentication/RBAC/branch hay API HRM và chưa đọc dữ liệu nghiệp vụ ra giao diện. Password local yếu theo yêu cầu, không dùng production. CI MySQL đã cấu hình nhưng chưa xác nhận chạy; npm audit cảnh báo high trước đó cần xử lý.
- Kiểm tra lại `npm run audit:prod` sau khi thêm MySQL adapter: vẫn báo 3 high qua `prisma → @prisma/config → effect` (GHSA-7589-6fvf-x4pw); audit chưa đạt, không bỏ qua CI. `pma.test` không phân giải được cả khi kiểm tra ngoài sandbox; chưa kiểm chứng đăng nhập phpMyAdmin.

## Identity & Multi-company — checkpoint an toàn 2026-11-25

- Hoàn tất preflight source/branch/worktree và xác minh MySQL read-only (`aurum_nestjs`, user `nestjs`, MySQL 9.6; bảng app nhìn thấy `companies`). Không thay đổi database ứng dụng.
- Thêm `@aurum/access` policy thuần fail-closed và 3 unit tests; kiểm tra quyền tường minh, user disabled, membership suspended/duplicate, company và branch. Chưa tích hợp auth/session hay endpoint, không tin input client.
- Bổ sung schema + migration identity_users/branches/company_memberships/branch_grants; FK ghép chặn cross-company. Áp migration chỉ lên `aurum_nestjs_test`, kiểm thử branch chéo company thất bại và transaction rollback. Chưa kiểm thử fresh migration hoặc production rollout, chưa cấp quyền ứng dụng, chưa có bảng mới trên database ứng dụng.
- Typecheck, build và test pass; PostgreSQL integration legacy skip. npm audit production vẫn fail 3 high GHSA-7589-6fvf-x4pw. GitHub Actions đã thêm test tenant MySQL nhưng chưa chạy trên GitHub. Chi tiết và lệnh tiếp theo tại `MASTER_CONTEXT.md`, `IMPLEMENTATION_HANDOFF.md`.
- Bổ sung package `@aurum/identity` với hàm Argon2id theo ngưỡng OWASP và hai unit tests; chưa có lưu tài khoản, session hay login. Typecheck/build chạy lại thành công; audit production vẫn fail cùng finding Prisma/effect.

## Batch 02 — checkpoint nền tảng session 2026-11-25

- Thêm `SessionService` và Prisma session store: token opaque ngẫu nhiên, chỉ lưu hash, hết hạn, từ chối user disabled và thu hồi theo chủ sở hữu. Unit test và integration MySQL kiểm tra các hành vi này; fixture integration được rollback trong `aurum_nestjs_test`.
- Migration `202611250004_sessions` chỉ được áp vào database test. Chưa chạy migration identity/session lên `aurum_nestjs`, chưa cấp quyền app trên các bảng mới và không tạo tài khoản hay dữ liệu nghiệp vụ.
- Đây chưa phải đăng nhập hoàn chỉnh: store chưa nối Nest module/controller, chưa có API login/logout, cookie, CSRF, rate limit, RBAC thực thi, tenant context tin cậy hoặc giao diện login. Không đưa chức năng này ra production. Xem `AUTHENTICATION.md` và `IMPLEMENTATION_HANDOFF.md`.
- `npm test` với MySQL test, `npm run typecheck`, `npm run build` và `git diff --check` thành công; integration PostgreSQL HRM cũ bị skip do không cấu hình. GitHub Actions chưa được xác minh. `npm run audit:prod` vẫn fail 3 high liên quan Prisma/effect; chưa tắt gate hay dùng sửa lỗi phá tương thích.

## Phân định ứng dụng

- Người dùng xác nhận `nestjsnextjsonekhach` là ứng dụng sản phẩm dành cho khách hàng; `nestjsnextjsoneadmin` là hệ thống quản trị. Hai đường dẫn tương ứng trỏ tới `apps/khach` và `apps/admin`. Đã cập nhật README và tài liệu bàn giao; chưa thay đổi chức năng hay giao diện. Ứng dụng khách hiện mới có trang giới thiệu, chưa phải sản phẩm hoàn chỉnh.

- Làm rõ: ứng dụng khách là trang bán hàng, không quảng cáo hệ thống quản trị. Đã đổi giao diện khởi đầu và metadata thành cửa hàng, với trạng thái danh mục chưa kết nối. Chưa có sản phẩm thật, giỏ hàng hay đặt hàng; không tạo dữ liệu giả.

## Kết nối GitHub product và admin

- Đã xác minh hai repository GitHub tồn tại, tại thời điểm kiểm tra chưa có nhánh mặc định. Đã thêm remote `product` và `admin` trong monorepo; giữ nguyên `origin`, không commit hoặc push. Hai đường dẫn ứng dụng là symlink tới thư mục trong cùng Git repository, nên các remote không tự tách hay đồng bộ từng ứng dụng. Cần thiết kế và kiểm tra cách tách code cùng dependency workspace trước khi publish; tránh push cả monorepo sang một repository con.

## Batch 02 continuation — checkpoint 2026-11-25

- CP0: đối chiếu source identity/access/session và schema/migration; `docs/architecture/` chưa tồn tại. Worktree có nhiều thay đổi chưa commit, branch `main`, HEAD `5e8ece4`; giữ nguyên remotes và dữ liệu.
- CP1 một phần: thêm `LogoutCommand`/`LogoutCommandHandler` và `LogoutAllCommand`/`LogoutAllCommandHandler` vào application layer của thư viện identity. Handler xác định user từ session token, không nhận user ID từ client. Sáu unit test identity pass, gồm từ chối token đã thu hồi và không ảnh hưởng user khác. Chưa nối HTTP, Nest module hoặc audit và chưa có kiểm thử concurrency; không coi là logout hoàn chỉnh.
- Các phần login, CSRF, MFA, RBAC lưu database, company/branch API và frontend tương ứng chưa hoàn thành. Không thay đổi database, commit, push hay deploy. Security audit Prisma/effect 3 high còn tồn tại theo kiểm tra trước; CI chưa xác minh. Xem `AUTHENTICATION.md` và `IMPLEMENTATION_HANDOFF.md`.

## Chính sách dữ liệu demo mới

- Theo yêu cầu mới của người dùng, cho phép tạo dữ liệu mẫu trong database demo/phát triển tách biệt để xem giao diện; thay thế yêu cầu cũ cấm mọi dữ liệu giả. Dữ liệu mẫu phải nhận diện rõ, được seed an toàn và lấy qua API, không lẫn database vận hành. Chưa tạo database demo, seed hay dữ liệu trong lần cập nhật luật này; API nghiệp vụ và xác thực vẫn chưa sẵn sàng.

## Chuẩn bị dữ liệu demo trong MySQL

- Người dùng yêu cầu bản ghi trong database, không phải dữ liệu hard-code frontend. Đã chuẩn bị `apps/api/scripts/seed-demo.mjs`, chỉ chấp nhận database `aurum_nestjs_demo` tại MySQL local và chỉ insert các công ty đánh dấu DEMO, không cập nhật/xóa bản ghi cũ. Chưa chạy seed: tài khoản migration hiện chỉ có quyền trên `aurum_nestjs` và `aurum_nestjs_test`, không có quyền tạo database demo. Không dùng database test làm demo hay sửa database nghiệp vụ để vượt hạn chế. Giao diện/API hiện chưa đọc company và chưa có login/RBAC.

- Cập nhật: đã dùng quyền quản trị MySQL có sẵn trên máy để tạo riêng `aurum_nestjs_demo`, cấp quyền giới hạn cho `nestjs_migrate` và quyền SELECT cho `nestjs`. Đã áp 3 migration lên database demo và seed hai dòng công ty có nhãn DEMO; tài khoản `nestjs` đọc được cả hai. Chạy seed lần hai insert 0 dòng. Không áp migration hoặc seed lên database ứng dụng/test. Dashboard chưa đọc dữ liệu này vì API nghiệp vụ và xác thực chưa triển khai.

## Nền tảng đọc công ty có phân quyền

- Thêm workspace library `@aurum/company` với `GetCompanyQuery`/handler, kiểm tra quyền `company.read` theo company trước khi gọi repository; thêm PrismaCompanyReader chỉ truy vấn theo ID. Unit test kiểm tra thiếu quyền/cross-company, integration dùng MySQL `aurum_nestjs_test` transaction rollback và pass. Đây chưa phải API hoặc giao diện hoạt động: chưa có principal tin cậy, controller, đăng nhập hay nối database demo vào dashboard. Không thay đổi dữ liệu demo/ứng dụng. npm audit online và CI chưa chạy ở checkpoint này.

## Batch 03 — CP0 và company query, 2026-11-25

- CP0 kiểm tra read-only: `aurum_nestjs` có 0 company, migration 001; `aurum_nestjs_test` có migration 001/003/004 và 0 company/user/membership/branch/grant/session; `aurum_nestjs_demo` có migration 001/003/004, 2 company và 0 user/membership/branch/grant/session. Các thư mục docs/architecture, security, quality, operations, roadmap chưa tồn tại. Giữ nguyên remote và thay đổi chưa commit.
- Quyền `nestjs` ở demo trước đây SELECT toàn schema, bao gồm password hash và migration history. Đã giảm còn SELECT riêng bảng companies; xác minh đọc được 2 company và truy vấn password hash bị từ chối. User `nestjs_migrate` giữ quyền schema giới hạn ở demo; không đổi quyền của database ứng dụng/test, không đổi DATABASE_URL.
- CP2 một phần: `ListCompaniesQueryHandler` xác nhận quyền theo principal server trước khi truy vấn; Prisma adapter lọc `id IN` trong SQL trước khi đếm/phân trang, hỗ trợ tìm theo tên, giới hạn page/pageSize. Unit test và MySQL integration transaction rollback kiểm tra cô lập, tìm kiếm, phân trang và input SQL injection. Chưa có status, branch/employee totals, audit, endpoint hay principal server thật. Count và list là hai truy vấn không cùng snapshot; cần đánh giá yêu cầu nhất quán và cơ chế pagination trước production.
- `npm run typecheck`, `npm run build`, `npm test` với MySQL test pass; test PostgreSQL HRM legacy skip vì chưa cấu hình. Không xác nhận GitHub Actions, audit online chưa chạy lại và finding 3 high Prisma/effect trước đây chưa xử lý. CP1, CP3–CP8 chưa hoàn thành; dashboard chưa kết nối, không có login và hai company demo chưa hiển thị.

## Dữ liệu mẫu trong database ứng dụng local

- Theo lựa chọn rõ ràng của người dùng, đã sao chép hai công ty có nhãn `[DEMO]` từ `aurum_nestjs_demo` vào `aurum_nestjs` bằng transaction và user ứng dụng `nestjs`; kiểm tra ID trùng và không cập nhật/xóa bản ghi hiện có. Sau commit xác nhận có đủ hai bản ghi. Đây là ngoại lệ local cho hai bản ghi được chỉ định, không phải phép seed bất kỳ vào production.
- Chưa có API company hay đăng nhập/ủy quyền; dashboard vẫn chưa hiển thị các bản ghi. Không đổi migration, DATABASE_URL hay database test.

## Batch 04 — database governance và seed company

- CP0: kiểm tra tài liệu hiện hữu, git/remote và source seed/schema. `aurum_nestjs` là development local; trước đó đã xác nhận có hai company DEMO. Không thay đổi DATABASE_URL, migration hoặc quyền DB trong checkpoint này.
- CP1: cập nhật `AGENTS.md` để cho phép seed có đánh dấu vào đúng database development local theo yêu cầu mới, không seed production; yêu cầu xác minh môi trường, đích, user/quyền và không xóa/ghi đè. Tạo `docs/database/DATABASE-GOVERNANCE.md`, `DATABASE-ENVIRONMENTS.md`, `DATABASE-SEEDING.md`.
- CP2 một phần: có `db:seed:development`, `db:seed:module -- company`, `db:health`, `db:status`, `db:verify`. Seed dùng Prisma, chỉ cho `NODE_ENV=development`, xác nhận ghi rõ ràng và URL local được allowlist; xác minh DB/user/quyền sau kết nối, transaction serializable, kiểm tra ID xung đột và không cập nhật/xóa. Seed chỉ hỗ trợ hai company, không hỗ trợ các module khác. Chưa triển khai `db:migrate:dev`, `db:backup` hay kiểm tra restore; `db:status` không kiểm tra migration.
- Xác minh: seed development và seed module chạy trên `aurum_nestjs` đều insert 0, giữ hai bản ghi. Health/status/verify pass. Unit guard từ chối production/test/remote/root và full `npm test` dùng MySQL test pass; PostgreSQL HRM legacy skip do thiếu cấu hình. Không có migration hay bản ghi mới. GitHub Actions chưa xác minh, audit high Prisma/effect vẫn tồn tại theo checkpoint trước; không báo bảo mật pass.
- `npm run typecheck` và `npm run build` workspace pass sau thay đổi.
- CP3–CP8 chưa hoàn tất: chưa có login/RBAC/API dashboard hoặc dữ liệu HRM. Seeder chỉ là công cụ development, không biến dữ liệu thành UI; xem handoff. Không commit/push/deploy.

## Batch 05 — CP0 và đổi mật khẩu nội bộ 2026-11-25

- CP0: đọc luật/tài liệu hiện có; branch `main` HEAD `5e8ece4`, nhiều thay đổi chưa commit, giữ nguyên remotes/worktree. Nest hiện chỉ đăng ký health; `aurum_nestjs` dùng MySQL và mới có migration 001, chưa có bảng identity/session. Chưa chạy migration hoặc thay đổi database ứng dụng.
- CP1 một phần: `@aurum/identity` thêm `ChangePasswordCommand`/handler: xác minh session và mật khẩu hiện tại, băm mật khẩu mới Argon2id, gọi port thay đổi. Prisma adapter thực hiện so sánh hash cũ phân biệt hoa thường và kiểm tra trạng thái/session trong transaction serializable, cập nhật mật khẩu và thu hồi phiên của user. Chưa đăng ký Nest, chưa có endpoint/cookie/CSRF/rate limit/audit, chưa là chức năng người dùng có thể sử dụng.
- Unit test identity pass; integration dùng `aurum_nestjs_test`, tạo hai user UUID và chỉ dọn các fixture đó, kiểm tra sai mật khẩu, hash Argon2id, thu hồi phiên đúng user và từ chối session đã thu hồi. Chưa kiểm thử truy cập đồng thời, retry deadlock, rollback khi DB lỗi hoặc API/CSRF. Không seed user/migration vào DB ứng dụng.
- `npm run audit:prod` chạy lại và fail 3 high `prisma → @prisma/config → effect` GHSA-7589-6fvf-x4pw; gợi ý force sẽ đổi major Prisma nên không chạy. GitHub Actions chưa xác minh. Login, RBAC lưu DB, dashboard và các checkpoint còn lại chưa hoàn thành; cần hoàn thiện login, session HTTP và quyền trước khi mở API.

## Batch 05 continuation — CP1 checkpoint 2026-11-25

- Đọc luật/tài liệu, source identity/schema và Git; giữ nguyên worktree, branch và dữ liệu. Database development vẫn có hai company DEMO theo `db:verify`. Không chạy migration, bootstrap user hoặc thay đổi DATABASE_URL.
- Thêm `GetCurrentUserQuery`/handler và `GetUserSessionsQuery`/handler trong `@aurum/identity`; dùng session xác thực để suy ra user, Prisma adapter chỉ select id/email/session metadata, giới hạn 100 session còn hiệu lực, không trả token hash. Unit và MySQL integration test kiểm tra session revoked, disabled, không lộ session của user khác và rollback test fixtures. Chưa đăng ký Nest module/controller; không có login API, cookie, CSRF, rate limit, audit, UI hay tài khoản admin.
- `npm run audit:prod` fail 3 high GHSA-7589-6fvf-x4pw: `prisma@7.10.1 → @prisma/config@7.10.1 → effect@3.20.0`, advisory ảnh hưởng effect <=3.22.0. Npm metadata có effect 3.22.5; cài sạch metadata workspace trong `/tmp` với override riêng vào `@prisma/config` cho thấy effect 3.22.5 và audit 0, nhưng override chưa được chứng minh tương thích và npm 10 trong checkout hiện tại không cập nhật dependency/lock như mong đợi. Một lần audit trên bản sao chỉ metadata ban đầu đã thiếu dependency, kết quả 0 không có giá trị. Đã khôi phục package/lock nguyên trạng trước thử nghiệm; dependency thực vẫn là effect 3.20.0, không suppress audit, không dùng force/downgrade major.
- Unit identity, typecheck và full test workspace với MySQL test pass; test PostgreSQL legacy skip nếu không cấu hình. GitHub Actions/E2E chưa chạy. CP1 chưa hoàn thành và không chuyển CP2; tiếp tục xác minh lockfile/cài sạch, full compatibility, login rate limit/CSRF và backup/migration an toàn trước khi mở API.

## Batch 05 continuation 02 — 2026-11-25

- CP0: đọc luật/tài liệu và source identity, kiểm tra Git; giữ các thay đổi chưa commit. Không sửa cấu hình hoặc dữ liệu database ứng dụng, không migration, không bootstrap account.
- CP1: finding GHSA-7589-6fvf-x4pw đến từ `prisma@7.10.1 → @prisma/config@7.10.1 → effect@3.20.0`. Override giới hạn `@prisma/config` lên effect 3.22.5; Prisma/Next/Nest không đổi major. Tạo bản sao source không secrets, sinh lockfile và `npm ci` sạch trong /tmp; `npm ls` xác nhận 3.22.5, typecheck/build/test MySQL và Prisma migration status test pass. Lockfile mới di chuyển postgres-array 2.0.0/3.0.4 giữa các vị trí hoist, không nâng version Prisma. Áp lock + override vào checkout, `npm ls` xác nhận và `npm audit --omit=dev` lẫn `npm audit` báo 0 vulnerabilities tại thời điểm kiểm tra. Override vượt version pin upstream nên phải theo dõi cập nhật Prisma và bỏ khi upstream vá; audit sạch không chứng minh bảo mật toàn hệ thống.
- CP2 một phần: thêm `RevokeSessionCommandHandler` kiểm tra session và chỉ thu hồi session đúng chủ; unit + MySQL test cross-user/revoked pass. Thêm `VerifyCredentials` Argon2id và Prisma reader đã test MySQL cho đúng/sai/không tồn tại/disabled; kết quả không tiết lộ hash. Đây chưa phải LoginCommand/engine: chưa có session issuance transaction, audit, brute-force/rate limiting, CSRF hoặc HTTP. Dummy hash phải là hash Argon2id hợp lệ do server tạo, và timing enumeration chưa được đánh giá toàn diện. Không nối API khi các controls thiếu.
- Full npm test với MySQL test, typecheck/build checkout chính pass; PostgreSQL HRM legacy skip vì không cấu hình. GitHub Actions, security E2E, migration và login UI chưa chạy. Không commit/push/deploy. Xem handoff để tiếp tục.

## Batch 05 CP1.2 — login nội bộ 2026-11-25

- Thêm `LoginCommand`/handler trong `@aurum/identity`, PrismaLoginStore và bảng audit. Handler xác minh Argon2id, phát token ngẫu nhiên 32 byte, chỉ lưu SHA-256 và thời hạn; adapter khóa user, so sánh trạng thái/hash phân biệt hoa thường và ghi session + login_success trong transaction. Login failure ghi event không chứa email, mật khẩu, token hoặc hash; không có HTTP endpoint.
- Migration `202611250005_auth_audit` chỉ áp lên `aurum_nestjs_test`, không áp vào `aurum_nestjs`, không thay đổi dữ liệu ứng dụng. Unit/public API test pass; MySQL integration test pass với đúng/sai/không tồn tại/disabled/locked, hai login đồng thời, hash token, audit và stale password. Fixture test xóa theo UUID do test tạo; các test khác dùng transaction rollback.
- Typecheck/build/full npm test với MySQL test pass; PostgreSQL HRM legacy skip. `npm audit` Node 22/npm 10 và Node 24/npm 11 báo 0 vulnerabilities. `npm ci` trong bản sao không secrets với Node 24/npm 11 hoàn tất nhưng `npm ls` báo effect@3.22.5 invalid do dependency upstream yêu cầu 3.20.0; Node 22/npm 10 nhận override đúng. Đây là vấn đề tương thích override chưa giải quyết, không bỏ qua và không khẳng định security/CI pass. Giữ Prisma 7.10.1 và override.
- CP1.2 chưa hoàn thành: chưa có audit logout/logout-all/password-change/revoke, rotation session cũ, xác nhận concurrent race toàn diện, Nest CQRS module/provider registration/architecture tests. Thiếu CSRF/cookie/rate limiting/guard, login HTTP và browser E2E; không mở endpoint. Chưa xác minh GitHub Actions.

## Batch 05 CP1.2.1 — checkpoint 2026-11-25

- Dependency: tái hiện Node 24.13.1/npm 11.8.0 báo `npm ls` invalid với effect 3.22.5; cùng Node 24/npm 10.9.4, scoped override và lockfile thì `npm ci`, `npm ls`, audit toàn bộ + production pass. Đây phù hợp với [npm workspace override issue #9514](https://github.com/npm/cli/issues/9514) nhưng chưa chứng minh cùng nguyên nhân nội bộ. Cấu hình `.nvmrc` 24.13.1, `packageManager` npm 10.9.4, engines và GitHub Actions pin cùng version. Không thay đổi Node/npm toàn máy; dùng PATH tạm cho test. Prisma 7.10.1 và effect 3.22.5 giữ nguyên.
- Rotation login: khi nhận token cũ hợp lệ về định dạng, transaction chỉ revoke session cùng user, ghi `session_rotation` và tạo token mới. MySQL test kiểm tra old token hết hiệu lực, token user khác không bị revoke, rollback khi audit collision, concurrent login và hash token. Chưa kiểm thử mọi race giữa logout/password change/login.
- Audit: thêm `PrismaAuditedSessionStore` ghi logout, logout_all, session_revocation trong cùng transaction; thêm password_change audit trong transaction đổi mật khẩu. Integration test xác minh cross-user và audit lỗi rollback. API chưa dùng adapter cho đến khi module an toàn được lắp.
- Thêm `@nestjs/cqrs@12.1.3`, `IdentityModule.forClient` nội bộ với CommandBus/QueryBus handlers và kiểm thử đăng ký MySQL. Module chưa import vào AppModule, không có HTTP endpoint. CQRS test dùng TypeScript đã biên dịch và CommonJS vì trộn ESM/CJS qua tsx tạo hai bản ModuleRef; test từ source ESM thất bại ban đầu và đã xử lý bằng cách dùng cùng CommonJS. Chưa xác minh startup runtime `tsx` khi module được lắp vào app.
- Full npm test với Node24/npm10 và MySQL test pass; PostgreSQL legacy skip. Typecheck/build pass; `npm audit` và `audit:prod` 0. `npm run lint` fail vì chưa có script ESLint. GitHub Actions cũ cho HEAD 5e8ece4 báo success nhưng không chứa thay đổi chưa commit, CI checkpoint này chưa chạy. Không migration development; `db:verify` xác nhận hai công ty còn nguyên.
- Chưa đánh dấu CP1.2 hoàn thành: cần race login/password-change/revocation, kiểm thử rollback password audit, exception/timing, production review và giải quyết ESLint; module chưa lắp vào AppModule. Không mở endpoint cho tới cookie/CSRF/rate limit/guard sẵn sàng.

## Batch 05 CP1.2.2 — identity hardening 2026-11-25

- MySQL integration test mới `identity-races.test.mjs`: concurrent đổi mật khẩu/logout/logout-all/rotation, hết hạn đúng biên, token đã thu hồi, disable user, password audit lỗi rollback cả hash/session. Race test chạy 3 lượt pass; test chỉ cho `aurum_nestjs_test`, dọn fixture theo UUID. Login đồng thời/session ownership đã test trước đó; test branch grant + policy dùng membership/branch đọc MySQL, permission là fixture vì permission store chưa có. Các test không chứng minh mọi race hoặc isolation API production.
- `identity-runtime.test.mjs` khởi chạy ứng dụng Nest HTTP thử nghiệm trên loopback, import HealthModule + IdentityModule, MySQL readiness 200, CommandBus/QueryBus login/logout hoạt động, `/auth/login` 404, app close ngừng lắng nghe và test client disconnect. Module này chưa import vào AppModule thật; DB client truyền vào IdentityModule do caller sở hữu. Chưa test signal OS, exception mapping nhạy cảm hoặc browser E2E.
- Thêm ESLint 9/TypeScript ESLint/Next config; lint root và từng workspace, bao gồm source/test/script, pass. Next 16 dùng ESLint CLI. Thêm kiểm tra kiến trúc static import dependency boundaries/cycle và test checker, pass; chuyển password functions sang domain để bỏ runtime import cycle. Checker chưa phân tích dynamic imports/require hoặc frontend, chưa chứng minh toàn bộ architecture. Các tsconfig đang strict và noUncheckedIndexedAccess.
- CI thêm `npm audit`, lint và architecture gates; các test Nest runtime nằm trong `npm test`. Chưa có browser E2E, container scanning hay workflow run mới; không tuyên bố CI pass. Full test MySQL test pass, PostgreSQL legacy skip, typecheck/build pass, npm audit production/full 0, clean `npm ci` và npm ls Node24/npm10 pass.
- Finding: npm thông báo ESLint 9.39.5 hết hỗ trợ; thử upgrade ESLint 10 gặp ERESOLVE với dependency hiện có, không dùng force/legacy-peer-deps. Đây là dev dependency, chưa có vulnerability audit nhưng cần giải quyết tương thích và theo dõi trước long-term. Knip exit 1 báo 3 file lịch sử/script và các dependency PostgreSQL/Prisma có thể chưa dùng; không tự xóa, cần review thủ công; unlisted tsx đã sửa bằng dependency root. Không migration vào development hoặc thay đổi user/company.
- CP1.2 chưa đánh dấu hoàn thành: chưa chứng minh audit chống sửa/xóa, mọi race/lock, exception mapping, OS-signal shutdown, role/permission store hoặc authorization API; chưa có auth HTTP/CSRF/rate limit/guard/browser E2E. Không deploy/commit/push.

## Publish hai frontend lên GitHub — 2026-11-26

- Theo lựa chọn người dùng, đã tạo snapshot độc lập và push branch `main`: admin `Thanhlong282828/nestjs-nextjs-one-admin` commit `84a2a526089de043ebaea3f335c221823d9d9d7e`; website bán hàng `Thanhlong282828/nestjs-nextjs-one-main-product` commit `2d3487f85396d633d1f959edf9e7eeea0df349d4`. Mỗi repo chỉ chứa frontend tương ứng, package lock và workflow riêng; không chứa Nest API, database, `.env` thật hay code frontend còn lại.
- Hai bản độc lập đã clean install, lint, typecheck, build, npm audit thành công; ESLint 9 vẫn có cảnh báo hết hỗ trợ. GitHub Actions ban đầu đang chạy tại thời điểm ghi. Chưa có login, dữ liệu API, checkout hoặc tính năng production theo trạng thái source.
- Các thư mục `apps/admin` và `apps/khach` trong monorepo vẫn giữ nguyên, không phải Git checkout độc lập và không tự đồng bộ các repo mới. Các repo được tách là snapshot, cần chiến lược đồng bộ/tách repo dài hạn trước các lần push tiếp theo. API và các thay đổi monorepo khác vẫn chưa được commit/push trong đợt này.
- Cập nhật xác minh: GitHub Actions frontend đầu tiên đã hoàn tất thành công cho cả hai commit nói trên.

## Xuất bản repository admin và API — 2026-11-26

Theo yêu cầu, repository `nestjs-nextjs-one-admin` chứa bản chụp Next.js admin, NestJS API, các package và tài liệu; storefront vẫn ở `nestjs-nextjs-one-main-product`. Hai repository là bản chụp riêng, không tự đồng bộ với workspace gốc. Không xuất bản tệp môi trường hoặc mật khẩu thật. Việc đưa mã lên GitHub không đồng nghĩa auth HTTP, phân quyền tenant hay hệ thống production đã hoàn thiện. Xem kết quả workflow GitHub tại commit được xuất bản để biết trạng thái thực tế.
