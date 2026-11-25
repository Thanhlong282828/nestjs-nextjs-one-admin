# Handoff — Identity & company checkpoint

## Mốc và trạng thái

- Kiểm tra ngày 2026-11-25: branch `main`, HEAD `5e8ece447b666cda65e8e59b23b9912f9790a006`, worktree chính `/Users/lahoathanh/Desktop/nestjsnextjs/nestjsnextjsone`, nhiều thay đổi chưa commit tồn tại từ trước và batch này. Không commit/push/reset/stash hay ghi đè chúng.
- Các symlink admin/khách trỏ vào apps workspace. Thực tế chưa có identity hoặc API doanh nghiệp. Các đoạn cũ trong PROGRESS là lịch sử; ưu tiên mục mới nhất.
- CP0–CP2: preflight/kiểm tra source, thiết kế và đối chiếu LaravelDji; đã xác minh MySQL `aurum_nestjs`, user ứng dụng, chỉ bảng `companies` hiển thị qua quyền ứng dụng. Không dump dữ liệu hoặc password.
- CP3: **một phần**: Prisma schema user/company membership/branch/branch grant và policy thuần `@aurum/access`. Không có login hay authorization enforcement trên API. Không có endpoint mới, UI mới hay bảng mới trong database ứng dụng.
- CP4–CP7: **chưa triển khai**. Có `@aurum/identity` băm/xác minh Argon2id độc lập với unit tests; chưa tích hợp tài khoản hay API. Login/logout, session, revocation, tenant context server, roles/permissions store, migration ứng dụng, frontend API và HRM còn thiếu. `passwordHash` chỉ là cột đề xuất, chưa có luồng lưu mật khẩu. Status đang là chuỗi chưa có DB CHECK. Không seed business data.

## Database / migration

- `202611250003_identity_org` tạo bốn bảng: identity_users, branches, company_memberships, branch_grants với FK có company scope. Generated SQL đã apply lên `aurum_nestjs_test` từ schema trước đó; **chưa apply lên `aurum_nestjs`**. Test transaction đã kiểm tra branch công ty khác bị FK từ chối và rollback.
- Chưa test fresh migration, migration rollout/rollback thực tế, concurrent DDL, hay cấp quyền app trên bảng mới. Xem `ARCHITECTURE-SECURITY.md` trước khi áp dụng. Không chạy migrate reset hoặc xóa volume.

## Chất lượng và findings

- `@aurum/identity`: 2 unit tests Argon2id pass (salt khác nhau, xác minh đúng/sai, input không hợp lệ); chưa có rate limiting, session hoặc login. `@aurum/access`: 3 unit tests pass (cross-company, cross-branch, disabled/suspended/duplicate, missing permission); cần test DB-backed authorization và API IDOR sau khi authentication hoạt động.
- MySQL test: migration upgrade thành công; API readiness với MySQL và test FK/rollback thành công. `npm test` pass với một test integration PostgreSQL HRM legacy bị skip vì không cấu hình service đó.
- `npm run typecheck`, `npm run build`, `git diff --check` pass. Chưa có Playwright/a11y/E2E, rate limit, CSRF hay session security test.
- `npm run audit:prod` fail: 3 high, GHSA-7589-6fvf-x4pw, `prisma@7.10.1 → @prisma/config → effect@3.20.0`. Không dùng `audit fix --force` mù quáng, không tắt gate. CI cấu hình thêm test DB nhưng chưa chạy trên GitHub; không báo CI pass.
- `pma.test` từng không phân giải; không thay đổi Herd/phpMyAdmin hoặc môi trường Laravel.

## File batch

- `packages/access/`: policy và unit tests. `packages/identity/`: hàm băm/xác minh Argon2id độc lập và unit tests.
- `apps/api/prisma/schema.prisma`, `apps/api/prisma/mysql-migrations/202611250003_identity_org/migration.sql`: schema/migration dự thảo.
- `apps/api/test/tenant-constraints.test.mjs`, `apps/api/package.json`, `.github/workflows/quality.yml`: integration test và cấu hình test.
- `package-lock.json`, README và tài liệu context/architecture/progress/handoff. Danh sách đầy đủ thay đổi chưa commit: `git status --short`.

## Bước tiếp theo chính xác

1. Xem xét và xử lý dependency audit; không áp migration database ứng dụng trong lúc còn thiếu đánh giá fresh/upgrade và rollout.
2. Thêm kiểm thử migration fresh + upgrade trên database test tách biệt, kiểm tra status constraints và cấp quyền app tối thiểu.
3. Tích hợp identity package Argon2id vào use case đã kiểm thử; triển khai session server-side an toàn, rate limiting và xác thực backend; kiểm thử login sai, lockout và revocation trước khi cung cấp API.
4. Tải membership/permissions từ server, nối `@aurum/access` vào use case và SQL scope, kiểm thử IDOR company/branch, rồi mới kết nối UI với dữ liệu thật.

Lệnh an toàn: `git status --short --branch`, `npm run typecheck`, `npm run test -w @aurum/access`, `npm run test -w @aurum/identity`, `npm run build`, `npm run audit:prod`. Test MySQL cần URL cho DB **aurum_nestjs_test** và user test/migration trong environment local; các guard trong `apps/api/test/tenant-constraints.test.mjs` từ chối đích không được phép. Không in `.env.mysql`, secret hoặc mật khẩu vào logs.

## Batch 02 — checkpoint mới nhất 2026-11-25

- Đã bổ sung `packages/identity` SessionService và unit tests; `apps/api/src/identity/prisma-session.store.ts` là adapter MySQL thực hiện lưu hash token, kiểm tra trạng thái user và thu hồi theo user. Adapter chưa được đăng ký trong Nest. SessionService yêu cầu caller tự đảm bảo xác thực, CSRF, rate limit và cookie policy; tuyệt đối không dùng trực tiếp dữ liệu client làm danh tính.
- `202611250004_sessions` đã apply **chỉ** vào `aurum_nestjs_test`; `aurum_nestjs` chưa có migration identity/session. Integration test dùng transaction rollback và xác nhận dữ liệu fixture không còn; kiểm tra giới hạn DB trước khi chạy. Chưa có login/logout, permission store, authorization thực thi, tenant context, UI login hoặc tài khoản. Chưa đánh giá fresh migration và cấp quyền tối thiểu cho app.
- Đã chạy full `npm test` với URL MySQL test riêng: pass, integration PostgreSQL HRM legacy skip; typecheck/build pass. `npm run audit:prod` vẫn fail 3 high qua `prisma@7.10.1 → @prisma/config → effect@3.20.0`; chưa chứng minh bản sửa tương thích. GitHub Actions chưa chạy xác minh.
- Tiếp tục theo `AUTHENTICATION.md`: xây dựng login/session HTTP và các kiểm soát biên đầy đủ, role/membership từ server và test quyền âm tính trước khi mở API. Không chạy migrate reset hoặc migrate deploy lên DB ứng dụng khi chưa đánh giá quyền, backup và rollout; không in `.env.mysql` hay credentials.

## Vai trò hai ứng dụng

`nestjsnextjsonekhach` trỏ tới `apps/khach`: ứng dụng sản phẩm dành cho khách hàng, hiện mới có trang giới thiệu. `nestjsnextjsoneadmin` trỏ tới `apps/admin`: hệ thống quản trị. Xây dựng trải nghiệm và quyền truy cập theo đúng đối tượng của từng ứng dụng; dữ liệu nghiệp vụ đi qua NestJS API có xác thực và phân quyền.

**Phân định mới nhất:** `apps/khach` là trang bán hàng cho người mua, không phải trang quảng cáo hệ thống quản trị; `apps/admin` là hệ thống quản trị. Trang bán hàng hiện chưa kết nối danh mục sản phẩm hoặc đặt hàng.

## Batch 02 continuation — checkpoint mới nhất

- CP0 đã kiểm tra Git, source và tài liệu; `docs/architecture/` chưa tồn tại. Worktree đã bẩn từ trước; không reset, commit, push hoặc chỉnh remotes/database.
- `packages/identity/src/application/session-commands.ts` thêm các command/handler logout hiện tại và logout tất cả, nhận token và suy ra user từ session; export qua public API của package. `packages/identity/test/session-commands.test.mjs` kiểm tra token bị thu hồi và giới hạn người dùng. Chưa có HTTP controller hay Nest registration, không có giao diện login/logout, CSRF, audit, kiểm thử concurrency hoặc database integration cho handler. Các phần CP1–CP9 còn phần lớn chưa triển khai; xem matrix trong `AUTHENTICATION.md`.
- Kiểm tra tiếp an toàn: thiết kế transaction/atomicity cho xác thực và thu hồi đồng thời, security boundary (cookie, CSRF, origin, rate limit), audit rồi test MySQL riêng và đăng ký Nest module khi đầy đủ; không đưa vào API chỉ dựa vào unit tests. Tiếp tục login, RBAC và tenant isolation theo module library + CQRS + MVC. Audit 3 high Prisma/effect vẫn chưa được xử lý; không hạ gate. Không migration vào DB ứng dụng.

## Chính sách demo mới nhất

Người dùng muốn dữ liệu mẫu trong database để xem giao diện. Luật trong `AGENTS.md` đã thay thế yêu cầu cũ cấm mọi dữ liệu giả: sử dụng database demo/phát triển tách biệt, seed có guard và idempotent, đánh dấu demo, không đưa vào database vận hành, không hard-code trên frontend. Chưa tạo database/seed/dữ liệu demo; API nghiệp vụ và phân quyền vẫn chưa hoàn chỉnh. Chuẩn bị kết nối, schema và quyền an toàn trước khi hiển thị dữ liệu.

## Chuẩn bị seed demo MySQL

`apps/api/scripts/seed-demo.mjs` chỉ nhận `DEMO_DATABASE_URL` trỏ `nestjs_migrate@127.0.0.1:3306/aurum_nestjs_demo`, chặn tham số URL khác và xác nhận database sau kết nối. Seed chỉ insert hai company được đánh dấu demo bằng UUID cố định, bỏ qua ID trùng, không update/delete. Chưa chạy, chưa tạo DB demo; tài khoản migration hiện không có quyền CREATE DATABASE hoặc quyền trên DB mới. Phải provision DB riêng và cấp quyền theo nguyên tắc tối thiểu bằng tài khoản quản trị MySQL, kiểm thử migration trước, rồi mới chạy seed; không dùng DB test hoặc DB vận hành. Chưa có API/UI đọc dữ liệu demo, không hứa sẽ hiển thị ngay.

Cập nhật: `aurum_nestjs_demo` đã được tạo trên MySQL local, ba migration MySQL đã áp và hai công ty DEMO đã seed; chạy lại insert 0. `nestjs` có SELECT trên database demo, `nestjs_migrate` có quyền schema giới hạn tại đó. API hiện vẫn cấu hình database `aurum_nestjs` và chưa có API đọc company/session đăng nhập; chưa có hiển thị demo trên dashboard. Không đổi nguồn API sang demo trước khi có isolation/auth và phân biệt rõ môi trường. Không lưu hoặc in credentials quản trị MySQL.

## Company query — checkpoint mới nhất

`packages/company` chứa `GetCompanyQueryHandler`, phụ thuộc public API `@aurum/access`; từ chối trước khi gọi repository nếu user/company/permission không phù hợp. `apps/api/src/company/prisma-company.reader.ts` là adapter Prisma truy vấn theo ID. Unit và integration MySQL test transaction rollback đã pass. Chưa đăng ký Nest provider/controller, chưa có principal được tải từ session hay quyền thực trong DB, chưa kết nối dashboard và database demo. Không đưa principal từ frontend vào handler. Tiếp tục hoàn thiện authentication, server-side membership/permission và test API IDOR trước khi nối UI; hiển thị nhãn demo và không lộ DB credentials.

## Batch 03 — checkpoint mới nhất

- CP0: MySQL app có 0 company và chỉ migration 001; test trống dữ liệu nghiệp vụ và có migration 001/003/004; demo có 2 company, không có user/membership/session và có migration 001/003/004. App user `nestjs` trên demo đã thu hẹp từ SELECT toàn schema xuống SELECT chỉ bảng companies; xác minh không thể đọc `identity_users.password_hash`. Quyền trên app/test không thay đổi; không sửa DATABASE_URL.
- `@aurum/company` thêm `ListCompaniesQuery`/handler và `CompanyListReader`; `PrismaCompanyReader.findPage` lọc company IDs được phép trong DB, tìm tên, phân trang và đếm; không tin client cung cấp principal. Test unit và MySQL test transaction rollback đã pass với input SQL injection và cross-company. Count/page là hai truy vấn có thể thấy snapshot khác nhau. Chưa có API/Nest module, principal từ session, status, branch/employee totals hoặc audit; không công khai adapter trước khi auth/server-side membership/permission sẵn sàng.
- Typecheck/build/full npm test có MySQL test pass; PostgreSQL HRM test legacy skip. CI chưa chạy; npm audit online chưa chạy lại, finding high trước đó vẫn cần xử lý. Demo chưa có user hay membership; xác thực, provisioning tài khoản demo, branch module, dashboard/API và dữ liệu thực theo quyền là phần còn lại. Không seed vào app/test, không commit/push/deploy.

## Hai company DEMO trong database ứng dụng local

Người dùng đã chọn tạo hai công ty mẫu có nhãn `[DEMO]` trong `aurum_nestjs`; đã sao chép hai bản ghi từ demo bằng transaction, xác minh hai ID và không sửa dữ liệu sẵn có. Đây là ngoại lệ cụ thể cho database local, thay thế thông tin cũ rằng database ứng dụng không có dữ liệu mẫu; không suy rộng cho production. API company, login và dashboard vẫn chưa nối; chưa có migration identity trên database ứng dụng.

## Batch 04 — checkpoint mới nhất

- `AGENTS.md` và ba file `docs/database/` cập nhật chính sách: `aurum_nestjs` là development local được phép seed demo đánh dấu, không seed production/test. Hai company có sẵn được giữ nguyên.
- `apps/api/scripts/development-target.mjs` allowlist chặt môi trường/database/user; `seed-development.mjs` kiểm tra user/database/quyền sau kết nối và seed transaction serializable, từ chối ID trùng khác tên. Script cần `NODE_ENV=development AURUM_ALLOW_DEVELOPMENT_SEED=1`; module chỉ hỗ trợ company. `database-inspect.mjs` hỗ trợ health/status/verify chỉ đọc. Lệnh và hạn chế trong `docs/database/DATABASE-SEEDING.md`. Không có migration hoặc backup command mới; không tự chạy migration application.
- Test guard pass, seed hai lần insert 0, health/status/verify pass; `npm test` với MySQL test pass, PostgreSQL legacy skip. Production readiness chưa được đánh giá, audit high Prisma/effect vẫn chưa xử lý, CI chưa xác minh. Seed chưa test xung đột/race trên database test vì guard cố ý chỉ cho phép development; cần thiết kế test isolated cho transaction và cạnh tranh trước khi mở rộng seed. Hoàn thiện auth, membership, API company và UI để hiển thị dữ liệu; không công bố endpoint riêng tư khi thiếu auth.

## Batch 05 — checkpoint mới nhất

- `packages/identity/src/application/change-password.ts`: command + handler dùng session đã xác minh, Argon2id và port; `apps/api/src/identity/prisma-password-change.store.ts`: transaction serializable cập nhật hash bằng điều kiện BINARY và session active rồi thu hồi các session user. `apps/api/test/password-change.test.mjs` kiểm thử MySQL test thực bằng fixture UUID được xóa theo ID sau test; unit test tại `packages/identity/test/change-password.test.mjs`.
- Chưa nối Nest module/controller/HTTP, chưa có login, CSRF/origin, rate limit, audit, principal/RBAC hoặc UI. Chưa test rollback khi lỗi revoke, các giao dịch cạnh tranh, xử lý/retry deadlock, session fixation, endpoint hoặc browser. Thời điểm xác minh session và cập nhật DB cần tiếp tục được đánh giá dưới tải và trạng thái thu hồi đồng thời; không tuyên bố production-ready. Không migration app, không seed user thật.
- `npm run audit:prod` ngày 2026-11-25 tiếp tục fail 3 high GHSA-7589-6fvf-x4pw, `npm audit fix --force` đề xuất hạ Prisma major; không áp dụng. Các checkpoint tiếp theo và GitHub Actions chưa hoàn tất/xác minh.

## Batch 05 continuation — checkpoint mới nhất

- `packages/identity/src/application/session-queries.ts` thêm query/handler xem user hiện tại và phiên đang hoạt động; `apps/api/src/identity/prisma-identity-query.store.ts` là adapter Prisma chưa đăng ký Nest. Query chỉ nhận token, suy ra actor qua SessionService; adapter scope user và không select token hash. MySQL integration tại `apps/api/test/session-store.test.mjs` test cross-user, revoke, disabled và rollback; giới hạn 100 session, chưa có pagination hay device metadata.
- Không có login API/UI, chưa có rate limiting/brute-force, CSRF/cookie, audit, trusted session guard hay bootstrap account. Chưa áp identity migrations vào `aurum_nestjs` hoặc tạo user; hai company vẫn tồn tại. Không mở query HTTP đến khi các controls đủ và được test. Đánh giá race khi thu hồi session/disable user giữa authenticate và đọc dữ liệu; E2E, CSRF, concurrency, rollback và rate limit chưa được kiểm chứng.
- Audit thực tế fail 3 high `effect@3.20.0` qua Prisma 7.10.1; effect 3.22.5 là bản trên ngưỡng advisory. Cài mới metadata workspace tại `/tmp/aurum-compat.gXcl34` có override effect 3.22.5, `npm ls` đúng và audit 0; đây không chứng minh tương thích runtime hoặc checkout hiện tại đã vá. Trong checkout hiện tại npm install/package-lock-only không cập nhật đúng lock; đã khôi phục hai file trước khi thử override. Thử nghiệm metadata ban đầu cho audit 0 thiếu dependency, không được tính. Cần tái tạo lock an toàn giữ mọi dependency/version hiện tại, kiểm tra `npm ci` trên bản sao đầy đủ và chạy full test/migration/client trước khi áp. Không force, không suppress hoặc báo audit pass.

## Batch 05 continuation 02 — checkpoint mới nhất

- Prisma/effect: `package.json` override `@prisma/config` → `effect@3.22.5`, `package-lock.json` sinh từ cài mới (so sánh version thấy effect thay đổi và postgres-array 2.0.0/3.0.4 thay vị trí hoist). Trên bản sao code không secrets, `npm ci`, typecheck, build, full npm test MySQL và `prisma migrate status` đối với DB test pass. Checkout chính đã `npm install`, `npm ls` xác nhận effect 3.22.5/Prisma 7.10.1; npm audit production lẫn toàn bộ báo 0. Đây là override tạm ngoài pin 3.20.0 của Prisma, cần theo dõi upstream và kiểm thử khi nâng cấp, không coi audit là security certification. PostgreSQL integration legacy skip; GitHub Actions chưa chạy.
- `packages/identity/src/application/verify-credentials.ts` và `apps/api/src/identity/prisma-credential.reader.ts` xác minh Argon2id, normalize email, reject disabled/absent/incorrect; dummy hash chỉ được inject phía server và phải là hash hợp lệ, cần đánh giá timing/account enumeration. Unit và MySQL test rollback pass. Chưa tạo LoginCommand, issue session, audit hoặc limiter, chưa expose qua HTTP.
- `RevokeSessionCommand`/handler lấy actor từ session và chỉ revoke session thuộc actor, test unit và MySQL cross-user. Chưa kiểm thử concurrent race/CSRF/rate limit và chưa đăng ký Nest module/controller.
- Ưu tiên tiếp: thiết kế LoginCommand và persisted, atomic rate-limit/audit/session issue có so sánh credential/state và session rotation; test login/IDOR/CSRF/race, chuẩn bị backup và migration app có kiểm soát; chỉ sau đó mở HTTP và tạo admin/UI. Chưa có login API/UI hay tài khoản, hai công ty database application được giữ nguyên; không migration/seed hoặc thay DATABASE_URL trong checkpoint này.

## Batch 05 CP1.2 — checkpoint mới nhất

- `packages/identity/src/application/login.ts`: LoginCommand/handler xác minh qua VerifyCredentials, tạo token CSPRNG, lưu hash và thời hạn; port `LoginStore` hỗ trợ audit failure và cấp session có điều kiện. `apps/api/src/identity/prisma-login.store.ts` khóa identity row, kiểm tra hash/status bằng BINARY, transaction serializable ghi session + login_success; failure ghi event không định danh. Schema/migration `202611250005_auth_audit` **chỉ áp lên aurum_nestjs_test**. Unit và MySQL integration pass, trong đó hai login đồng thời tạo token riêng và test stale hash; test xóa fixture đúng ID do test tạo.
- Chưa có audit logout/logout-all/password change/revoke; chưa session rotation hoặc kiểm thử race login/password-change/revocation/atomic audit failure; chưa Nest CQRS module/provider registration, rate limit, cookie, CSRF, endpoint, UI, E2E hay admin bootstrap. Không kết nối vào HTTP hoặc coi CP1.2 hoàn thành. Login failure audit không nhận email/user để tránh rò danh tính, vì vậy chưa đủ điều tra abuse; cần thiết kế retention, anti-flood và audit policy trước production.
- `npm ci` bản sao Node 24/npm 11 thành công nhưng `npm ls` báo effect@3.22.5 invalid so với pin upstream 3.20.0, trong khi Node 22/npm 10 công nhận override. `npm audit` cả hai báo 0; không coi đây là chứng minh tương thích npm 11 hoặc GitHub CI. Giữ Prisma 7.10.1/override hiện tại, tìm cách tái hiện và giải quyết mà không suppress. Typecheck/build/full tests MySQL pass; PG legacy skip, CI chưa chạy. Không migration database ứng dụng.

## Batch 05 CP1.2.1 — checkpoint mới nhất

- Node/npm: `.nvmrc` 24.13.1, `packageManager` npm 10.9.4, engines và workflow được đồng bộ. Node24/npm10 clean `npm ci` trong bản sao và `npm ls effect @prisma/config @nestjs/cqrs prisma` pass, audit cả hai phạm vi 0. Node24/npm11.8 `npm ls` trước đó báo invalid; có [npm issue #9514](https://github.com/npm/cli/issues/9514) tương tự nhưng nguyên nhân chưa được chứng minh. Override Prisma/effect giữ nguyên. Chưa cài/chuyển Node/npm global trên máy; local dùng nvm và cài đúng npm cho node. GitHub Actions mới chưa chạy; run success cũ là commit 5e8ece4.
- `LoginCommand` có `previousSessionToken` tùy chọn; PrismaLoginStore transaction revoke token cũ chỉ trong phạm vi user và audit session_rotation, tạo session mới + login_success. Test MySQL kiểm tra token cũ, cross-user, hai login đồng thời và audit collision rollback. Cần test race credential change/logout và session fixation ở HTTP.
- `PrismaAuditedSessionStore` ghi logout, logout_all, session_revocation cùng transaction; `PrismaPasswordChangeStore` ghi password_change trong transaction. Test MySQL kiểm tra scope và rollback logout khi audit lỗi, chưa kiểm tra password audit rollback hoặc tất cả concurrency.
- `@nestjs/cqrs@12.1.3`; `apps/api/src/identity/identity.module.ts` là dynamic module nội bộ, nhận Prisma client/dummy hash server, đăng ký use cases + handlers; `identity-cqrs.test.mjs` dùng Nest CommandBus/QueryBus thực với MySQL test và kiểm tra events. Không import vào AppModule, không controller/HTTP; test dùng output TypeScript CJS vì tsx ESM/CJS đôi khi tạo ModuleRef khác nhau. Cần test bootstrap runtime/dev thực trước khi tích hợp app, guard/rate limit/CSRF/cookie trước endpoint.
- Full npm test Node24/npm10/MySQL test, typecheck/build pass; legacy PostgreSQL skip. npm audit production/full 0; npm run lint fail do thiếu script. Không migration database development, `db:verify` xác nhận hai company. Còn thiếu E2E, audit và security review toàn diện; chưa đóng CP1.2.

## Batch 05 CP1.2.2 — checkpoint mới nhất

- `apps/api/test/identity-races.test.mjs`: test MySQL có fixture tự tạo kiểm tra đồng thời password/logout/logout-all/rotation, account disable, expiration/replay và password-audit collision rollback. Ba lượt pass; lỗi cạnh tranh chỉ chấp nhận serialization/deadlock có nhận diện, không tự retry. `PrismaPasswordChangeStore` nhận audit ID factory để test rollback; production mặc định randomUUID. Test không bao phủ mọi interleaving, stress đa instance hoặc login đối đầu đổi mật khẩu.
- `apps/api/test/identity-runtime.test.mjs`: Nest app thử nghiệm mở loopback, import IdentityModule và HealthModule, DB test, CQRS login/query/logout, readiness, auth route 404 và close. Client Prisma của IdentityModule do caller sở hữu và test tự disconnect; chỉ test app.close, không chứng minh OS signal/shutdown thật hoặc AppModule production. Chưa có exception mapping security hay HTTP auth.
- `apps/api/test/tenant-constraints.test.mjs`: FK ghép và access policy cross-company/branch từ DB membership/grants; quyền là fixture, vì store RBAC thực chưa có. Không coi là API tenant isolation hoàn chỉnh.
- ESLint config root + script từng workspace, lint cả TS source và Node mjs tests/scripts; `npm run lint` pass. Dùng eslint-config-next và typescript-eslint recommended, no-explicit-any, Next core web vitals; không phải typed lint đầy đủ. ESLint 9.39.5 được npm báo unsupported, thử 10 bị ERESOLVE (peer plugin import hiện hỗ trợ đến 9); không force/suppress. Cần tìm cấu hình/plugin upstream tương thích và lặp lại audit/CI. `scripts/check-architecture.mjs` + self-test kiểm tra static imports, không dynamic require/frontend; đã di chuyển password functions khỏi index để bỏ cycle.
- Knip read-only exit 1: schema PostgreSQL legacy, seed-demo, verify-enterprise và dependency API PostgreSQL/Prisma có thể không dùng; có entrypoints/generated có thể gây false positives, kiểm tra trước khi xóa. Đã khai báo tsx/TypeScript root. Dependency audit 0 không phải security certification.
- Workflow thêm audit đầy đủ, lint, architecture; `npm test` chứa runtime test. Clean npm ci/ls Node24.13.1/npm10.9.4, typecheck/build/lint/full MySQL tests pass; PostgreSQL HRM skip vì service không cấu hình, chưa có GitHub workflow run cho thay đổi này. Không migration DB development, không tạo admin, không mở auth HTTP. Cần rà soát audit tamper/retention, race, Signal lifecycle, permission store và bảo vệ HTTP trước CP1.3.

## Publish frontend riêng — 2026-11-26

- Người dùng chọn hai repository riêng: `nestjs-nextjs-one-admin` branch main commit `84a2a526089de043ebaea3f335c221823d9d9d7e`; `nestjs-nextjs-one-main-product` branch main commit `2d3487f85396d633d1f959edf9e7eeea0df349d4`. Đã push thành công, mỗi repo gồm snapshot frontend tương ứng được chuẩn bị thành Next.js độc lập với lockfile và workflow. Không có source Nest API hoặc credentials thật. Hai repo public tại thời điểm publish.
- Source trong monorepo là thay đổi chưa commit; không tạo nested Git hoặc thay symlink admin/khach. Bản tách không tự đồng bộ với monorepo: khi tiếp tục cần quyết định/thiết kế quy trình duy trì các repository riêng, không `git push admin/product` nguyên monorepo. Backend chưa được đưa lên GitHub trong đợt này.
- Clean install, lint, typecheck, build và npm audit của từng bản tách đều pass. Workflow lần đầu đang chạy khi ghi; kiểm tra Actions trước khi kết luận. Chức năng login/DB vẫn chưa kết nối; chưa production-ready. Bản test MySQL monorepo pass, integration PostgreSQL legacy skip.
- Cập nhật: workflow frontend đầu tiên đã hoàn tất thành công trên cả admin và product; kết quả này chỉ áp dụng hai commit snapshot, không xác minh CI monorepo hay backend.

## Xuất bản repository admin và API — 2026-11-26

Theo yêu cầu, repository `nestjs-nextjs-one-admin` chứa bản chụp Next.js admin, NestJS API, các package và tài liệu; storefront vẫn ở `nestjs-nextjs-one-main-product`. Hai repository là bản chụp riêng, không tự đồng bộ với workspace gốc. Không xuất bản tệp môi trường hoặc mật khẩu thật. Việc đưa mã lên GitHub không đồng nghĩa auth HTTP, phân quyền tenant hay hệ thống production đã hoàn thiện. Xem kết quả workflow GitHub tại commit được xuất bản để biết trạng thái thực tế.
