> **Lịch sử:** Aurum đã được người dùng yêu cầu chuyển sang MySQL. Cấu hình đang dùng: [MYSQL-SETUP.md](MYSQL-SETUP.md). PostgreSQL và dữ liệu cũ được giữ nguyên.

# PostgreSQL + Prisma cho Aurum

## Cấu hình local

- Container Compose: `postgres_enterprise`, image PostgreSQL 17; chỉ mở `127.0.0.1:5433`.
- Database ứng dụng: `enterprise_db`. Database kiểm thử: `enterprise_test`.
- User ứng dụng: `enterprise_app` (không superuser, không quyền tạo database/role). `enterprise_migrator` là user riêng cho migration; `enterprise_admin` chỉ khởi tạo/quản trị local.
- Volume riêng `enterprise_postgres_data`; PostgreSQL cũ của Aurum tại 5434 và volume cũ được giữ nguyên. Không xóa volume hoặc chạy `docker compose down -v` khi cần giữ dữ liệu.
- `.env.enterprise` chứa mật khẩu ngẫu nhiên và chuỗi kết nối local, được Git bỏ qua; giữ file này nếu muốn tiếp tục truy cập volume đã tạo. Mất mật khẩu cần quy trình khôi phục có kiểm soát, không tự ý tạo volume mới. Không đưa mật khẩu lên Git hoặc frontend. `.env.enterprise.example` chỉ có placeholder, phải thay bằng ba mật khẩu mạnh và nhất quán trước khi dùng trên máy khác; `POSTGRES_PASSWORD` và `ENTERPRISE_ADMIN_PASSWORD` phải cùng giá trị, các URL phải khớp mật khẩu tương ứng.

```sh
cd ~/Desktop/nestjsnextjs/nestjsnextjsone
# Nếu chưa có .env.enterprise, tạo từ .env.enterprise.example và đặt mật khẩu riêng.
docker compose up -d postgres_enterprise
docker compose ps postgres_enterprise
npm ci
npm run prisma:deploy -w @aurum/api
npm run dev:api
```

`/health` là liveness; `http://127.0.0.1:4000/health/ready` chạy truy vấn thông qua Prisma, trả 503 nếu không kết nối được. Prisma CLI dùng `MIGRATION_DATABASE_URL`; ứng dụng dùng `DATABASE_URL`. `npm run dev:api` nạp `.env.enterprise`, còn production phải nạp biến môi trường và TLS theo môi trường triển khai. Chỉ NestJS kết nối PostgreSQL; Next.js không dùng `DATABASE_URL`.

## Kết nối DBeaver trên macOS

DBeaver đã được tìm thấy tại `/Applications/DBeaver.app`. Mở DBeaver → **New Database Connection** → **PostgreSQL**, sau đó nhập:

| Trường | Giá trị |
| --- | --- |
| Host | `127.0.0.1` |
| Port | `5433` |
| Database | `enterprise_db` |
| Username | `enterprise_app` |
| Password | Giá trị `ENTERPRISE_APP_PASSWORD` trong `.env.enterprise` |

Có thể mở file local bằng `open -e .env.enterprise` để xem mật khẩu; file chứa cả mật khẩu quản trị và migration, không chia sẻ. Chọn **Test Connection**; DBeaver có thể đề nghị tải JDBC driver lần đầu. Sau đó **Finish**. Nếu máy khác chưa có DBeaver, tải DBeaver Community từ [trang tải chính thức](https://dbeaver.io/download/) và cài theo hướng dẫn của nhà cung cấp. DBeaver chỉ thao tác với database bạn chọn; lưu ý không dùng tài khoản migration/admin cho các thao tác hằng ngày.

## Migration và kiểm thử

`apps/api/prisma/schema.prisma` định nghĩa bảng `companies`; hai migration đầu tạo bảng trống và giới hạn quyền sửa lịch sử migration. Chưa tạo dữ liệu nghiệp vụ. `npm run prisma:deploy -w @aurum/api` áp dụng migration đã có, không tự xóa database. Không dùng `prisma migrate reset` trên database ứng dụng. User migration local không có quyền tạo database; tạo migration mới cần quy trình phát triển/test riêng và kiểm tra migration trên database test trước.

Đã kiểm thử Prisma CRUD với dữ liệu tạm chỉ trong `enterprise_test`, restart riêng container enterprise, xác nhận bản ghi còn, rồi xóa bản ghi test. Tập lệnh `apps/api/scripts/verify-enterprise.mjs` có guard database/host và **restart container**; chỉ dùng trong môi trường local test được phép, không chạy trong production. Bộ test HRM cũ vẫn dùng `aurum_test` trên container 5434 riêng; xem README.

## Ranh giới hiện tại

Chưa có API HRM, login, tenant/branch, upload hay dashboard dữ liệu thật. DBeaver được phát hiện đã cài nhưng chưa được mở để tạo kết nối bằng giao diện; Prisma đã kết nối bằng chính user ứng dụng. Tính năng Prisma hiện chỉ có readiness và schema Company, không ngụ ý ứng dụng hoàn chỉnh. Chưa dùng PostgreSQL 19 của Postgres.app.

`npm audit` ngày 2026-11-25 cảnh báo high GHSA-7589-6fvf-x4pw tại `effect@3.20.0`, phụ thuộc transitively qua `@prisma/config` và `prisma@7.10.1`; audit production cũng báo lỗi trong workspace. Không bỏ qua gate hoặc tự chạy `npm audit fix --force`; theo dõi bản vá tương thích, đánh giá exposure và kiểm thử lại trước khi dùng production.
