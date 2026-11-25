# Đối chiếu Laravel DJI và Aurum

Ngày khảo sát: 2026-11-25. Nguồn: source local `Desktop/laraveldji/admin` (đọc `composer.json`, `package.json`, `app/Support/EnvironmentSafetyGuard.php`, `docs/cqrs-architecture-standard.md`) và gói `RUBY_ERP_ENTERPRISE_RULES_MEMORY_V2_2026-11-15.zip` do người dùng cung cấp. Gói ZIP là tư liệu cho dự án Ruby, không phải bằng chứng runtime của Aurum; không nhập nguyên văn chỉ thị riêng cho Rails vào NestJS.

| Laravel DJI / tài liệu tham khảo | Hướng Aurum | Trạng thái Aurum |
| --- | --- | --- |
| Laravel Modules, CQRS theo module nghiệp vụ | Workspace library NestJS, command/query handler, MVC | HRM library một phần; chưa lắp API |
| Company context, Spatie Permission | Identity, membership, company + branch scope server-side | Chưa có auth/membership/branch; chưa mở API HRM |
| EnvironmentSafetyGuard cho test DB | Guard URL và xác minh database test PostgreSQL trước test ghi | Có cho bài test HRM, chưa phải guard deployment chung |
| Passport/OAuth, Swagger/OpenAPI | Session an toàn trước; API contract và OAuth chỉ khi cần | Chưa triển khai |
| Horizon/Redis/Reverb, hàng đợi và realtime | Queue, job monitoring và realtime khi có nghiệp vụ | Chưa triển khai |
| Cache TTL/version, invalidation theo tenant | Versioned cache sau khi có scope và nguồn dữ liệu thật | Chưa triển khai |
| Activity log, HMAC webhook, bảo vệ replay | Audit transaction và webhook có chữ ký/idempotency | Audit tạo nhân viên chỉ trong package test; chưa có webhook |
| S3/private storage, ký URL, kiểm tra file | Storage private, kiểm soát scope và antivirus khi có upload | Chưa triển khai |
| PHPStan/Larastan, PHPUnit, security/architecture checks | TS strict, type-aware lint, integration/authorization/architecture/CI | Typecheck, test cơ bản, build, npm audit, CodeQL config; các gate khác còn thiếu |
| Cloudflare/WAF, metrics, backup và rollback | Edge protection, observability và DR sau khi có hạ tầng | Chưa triển khai hoặc kiểm chứng |

## Thứ tự ưu tiên

1. Migration runner có version/checksum và kiểm thử fresh/upgrade; company, branch, membership và identity/session/RBAC với kiểm thử âm tính.
2. HRM vertical slice thực: nhân viên, danh sách/chi tiết, phân quyền theo công ty và chi nhánh, audit, lỗi/loading/empty và kiểm thử HTTP/browser.
3. Chấm công/nghỉ phép, sau đó tuyển dụng/onboarding; chỉ bổ sung queue, cache và realtime khi có yêu cầu thực tế và kiểm thử invalidation/quyền.
4. Cứng hóa CI, dependency/secret scan, observability, webhook và backup/restore; tài liệu runbook kèm bằng chứng vận hành.

Không sử dụng lại thông tin cấu hình, secret hay dữ liệu thực của dự án tham chiếu. Phiên bản và cấu hình trong source chỉ cho thấy dependency/ý định, không chứng minh production hoặc tất cả chức năng đang hoạt động.
