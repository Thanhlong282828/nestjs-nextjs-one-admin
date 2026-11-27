# Aurum ERP

Nền tảng ERP đang xây dựng: NestJS API, Next.js admin và cổng khách, thiết kế tiếng Việt tông vàng. Dashboard hiện hiển thị trạng thái chưa kết nối, không có dữ liệu nghiệp vụ giả; chưa phải hệ thống ERP production.

`apps/khach` (`nestjsnextjsonekhach`) là ứng dụng sản phẩm dành cho khách hàng; `apps/admin` (`nestjsnextjsoneadmin`) là hệ thống quản trị. Trang giới thiệu hiện có trong ứng dụng khách chỉ là trạng thái ban đầu, chưa phải sản phẩm hoàn chỉnh. Hai ứng dụng gọi NestJS API theo quyền phù hợp.

## Chạy local

Cần Node.js 24.13.1 và npm 10.9.4 (xem `.nvmrc` và `packageManager`). Với nvm, chọn `nvm use` rồi kiểm tra `node --version` và `npm --version`; nếu npm chưa đúng, cài npm 10.9.4 cho Node đang dùng. Tại thư mục gốc:

```sh
npm ci
npm run dev:admin  # http://localhost:3000
npm run dev:khach  # terminal khác, http://localhost:3001
npm run dev:api    # terminal khác, http://127.0.0.1:4000/health
```

Aurum hiện dùng MySQL local `127.0.0.1:3306`, database riêng `aurum_nestjs`. NestJS dùng Prisma, đọc `DATABASE_URL` từ `.env.mysql` local; không đưa credentials vào Next.js. Tài khoản ứng dụng là `nestjs`; migration dùng tài khoản riêng. Xem [hướng dẫn MySQL](docs/MYSQL-SETUP.md). Các PostgreSQL và volume trước đây được giữ nguyên, không còn là database ứng dụng đang dùng.

Lệnh tạo dữ liệu mẫu an toàn cho database development và các giới hạn hiện tại: [hướng dẫn seed](docs/database/DATABASE-SEEDING.md).

`http://127.0.0.1:4000/health` kiểm tra tiến trình; `http://127.0.0.1:4000/health/ready` kiểm tra MySQL qua Prisma. Chưa có authentication, phân quyền hay kết nối dữ liệu HRM tới giao diện.

Hai đường dẫn `../nestjsnextjsoneadmin` và `../nestjsnextjsonekhach` là liên kết tới `apps/admin` và `apps/khach` để code vẫn được quản lý chung trong Git. Trên máy khác, sử dụng đường dẫn trong `apps/`.

Git remotes `product` và `admin` lần lượt trỏ tới repository bán hàng và quản trị trên GitHub; `origin` vẫn là repository monorepo ban đầu. Đây chỉ là các remote của **cùng một Git repository**, không tự giới hạn nội dung theo thư mục. Không push nguyên monorepo tới hai remote này khi chưa thiết kế và kiểm tra cách tách code, phụ thuộc workspace và bí mật.

```sh
npm run typecheck
npm run lint
npm run test:architecture
npm test
npm run build
npm run audit:prod
```

Chưa có tài khoản hay đăng nhập. Khi xây seed local, yêu cầu mật khẩu demo `12345678` chỉ dành cho môi trường phát triển và không dùng trong production. Xem [tiến độ và kế hoạch](docs/PROGRESS.md) và [luật dự án](AGENTS.md).

## Nền tảng HRM

`packages/hrm` là thư viện workspace chứa command/query, domain và adapter PostgreSQL cũ; chưa chuyển sang MySQL. Hiện chưa có endpoint hay xác thực và giao diện chưa kết nối dữ liệu HRM. Các migration chưa được áp lên database ứng dụng.

Để chạy kiểm thử PostgreSQL, dùng database test riêng đã tạo trước (ví dụ `aurum_test`) và Docker Compose đang chạy:

```sh
HRM_TEST_DATABASE_URL='postgresql://aurum:local-development-only@127.0.0.1:5434/aurum_test' npm test
```

Nếu chưa có database test, tạo một lần bằng `docker compose exec -T postgres createdb -U aurum aurum_test`. Kiểm thử chỉ chấp nhận endpoint loopback và database `aurum_test`, xác minh database sau kết nối, chỉ xóa các bản ghi test được gắn company UUID ngẫu nhiên. Nếu không khai báo biến, bài kiểm thử PostgreSQL được đánh dấu bỏ qua. Không dùng database production cho kiểm thử.

Tình trạng thực tế và bước tiếp theo: [MASTER_CONTEXT](docs/MASTER_CONTEXT.md), [IMPLEMENTATION_HANDOFF](docs/IMPLEMENTATION_HANDOFF.md). Migration identity mới chỉ áp dụng trên database test; không chạy migration ứng dụng trước khi đánh giá và kiểm tra quyền.

**Phân định mới nhất:** `apps/khach` là trang bán hàng cho người mua, không phải trang quảng cáo hệ thống quản trị; `apps/admin` là hệ thống quản trị. Trang bán hàng hiện chưa kết nối danh mục sản phẩm hoặc đặt hàng.
