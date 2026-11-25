# Seed development

Hiện chỉ hỗ trợ seed **company**: hai bản ghi `[DEMO]` với UUID ổn định. Các module khác chưa có dữ liệu seed. Script dùng Prisma và `DATABASE_URL` trong `.env.mysql`, từ chối mọi đích trừ MySQL local `nestjs@127.0.0.1:3306/aurum_nestjs`; xác minh DB và user thực sau kết nối. Xung đột ID có tên khác làm transaction thất bại, không overwrite/delete. Không hỗ trợ production hoặc database test.

Chạy có chủ đích tại thư mục dự án:

```sh
NODE_ENV=development AURUM_ALLOW_DEVELOPMENT_SEED=1 npm run db:seed:development
# Hoặc chỉ định module hiện có:
NODE_ENV=development AURUM_ALLOW_DEVELOPMENT_SEED=1 npm run db:seed:module -- company
```

Các lệnh kiểm tra chỉ đọc:

```sh
NODE_ENV=development npm run db:health
NODE_ENV=development npm run db:status
NODE_ENV=development npm run db:verify
```

`db:health` kiểm tra kết nối; `db:status` đếm công ty, không kiểm tra migration; `db:verify` kiểm tra hai bản ghi demo. Tất cả giới hạn đúng đích development local. Các lệnh cần Prisma client đã generate; seed không chạy migration. `db:migrate:dev` và `db:backup` chưa được triển khai. Trước khi bổ sung module, tạo schema/migration và ranh giới permission, test trên database test. Không xóa hoặc seed dữ liệu khách hàng thật. Có database không đồng nghĩa dashboard đã kết nối: API company/login/RBAC vẫn còn thiếu.
