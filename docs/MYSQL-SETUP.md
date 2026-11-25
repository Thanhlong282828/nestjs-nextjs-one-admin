# MySQL cho Aurum

## Môi trường local hiện tại

- MySQL đang dùng: `127.0.0.1:3306` của môi trường Laravel local. Aurum có database riêng `aurum_nestjs`; database kiểm thử riêng `aurum_nestjs_test`.
- Tài khoản ứng dụng `nestjs` được cấp quyền SELECT, INSERT, UPDATE, DELETE **chỉ trên bảng `companies` của mỗi database Aurum**; không phải admin. Tài khoản `nestjs_migrate` riêng có quyền schema cần cho migration trên hai database đó. Khi thêm bảng mới phải cấp quyền app có giới hạn sau khi migration được kiểm tra.
- `.env.mysql` chứa `DATABASE_URL` và `MIGRATION_DATABASE_URL`, bị Git bỏ qua; script API đọc file này. `.env.example` là mẫu placeholder. `.env` và `.env.enterprise` cũ được giữ nguyên, không dùng cho API hiện tại.
- Mật khẩu `12345678` cho `nestjs` được người dùng yêu cầu chỉ dùng local; phải thay bằng mật khẩu mạnh và cấu hình secret phù hợp trước khi triển khai thật. Không commit `.env.mysql` hay gửi thông tin user migration.

```sh
npm ci
# Migration identity mới đang chờ review; không áp dụng vào database ứng dụng.
npm run dev:api
```

`/health/ready` thực hiện truy vấn MySQL qua Prisma, không chứng minh schema/authorization đã hoàn tất. Dữ liệu Company chưa được đưa ra API hoặc UI. Next.js không kết nối database trực tiếp.

## phpMyAdmin

`pma.test` là website quản lý MySQL, không phải giá trị host của database. User `nestjs` có thể dùng để đăng nhập phpMyAdmin nếu trang được cấu hình cho phép chọn/đăng nhập user và kết nối tới MySQL local trên. Dữ liệu Aurum nằm trong `aurum_nestjs` → `companies`. Tại thời điểm kiểm tra `pma.test` không phân giải DNS nên chưa xác nhận được giao diện đăng nhập hoặc phpMyAdmin đang trỏ đúng server; không tự thay đổi cấu hình Herd/phpMyAdmin. Nếu cần xác minh, kiểm tra trang phpMyAdmin, dịch vụ Herd và cấu hình server của phpMyAdmin trên máy.

## Migration và kiểm thử

Prisma schema chính và `mysql-migrations` dành cho MySQL; schema/migration PostgreSQL cũ được giữ lại làm lịch sử. Migration MySQL đã chạy trên database test rồi database Aurum mới, chỉ tạo bảng trống, không seed nghiệp vụ. Đã kiểm tra CRUD bằng Prisma trên `aurum_nestjs_test`, dọn bản ghi test, và readiness API với user `nestjs` trên `aurum_nestjs`.

Package `@aurum/hrm` vẫn chứa repository PostgreSQL cũ, chưa được nối vào API và chưa chuyển sang MySQL. Không coi HRM đã hoạt động. CI được cấu hình thêm service MySQL cho migration/readiness và giữ PostgreSQL cho test legacy; trạng thái CI thực tế chưa được xác minh.

Các container/volume PostgreSQL cũ không bị xóa hoặc chuyển dữ liệu; không chạy `docker compose down -v` nếu cần giữ chúng. Prisma/effect từng có cảnh báo npm audit high; phải kiểm tra lại trước production, không bỏ qua gate.

Lưu ý 2026-11-25: migration `202611250003_identity_org` mới được chạy trên `aurum_nestjs_test`. Lệnh `npm run prisma:deploy` với `.env.mysql` mặc định nhắm database ứng dụng, vì vậy phải kiểm tra và đánh giá trước khi chạy.
