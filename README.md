# Aurum ERP — Admin và NestJS API

Repository chứa ứng dụng quản trị Next.js, NestJS API và các thư viện nghiệp vụ. Trang bán hàng nằm trong [repository product](https://github.com/Thanhlong282828/nestjs-nextjs-one-main-product). Đây là ảnh chụp mã từ workspace gốc; các repository không tự đồng bộ.

Cần Node 24.13.1 và npm 10.9.4. Chạy `npm ci`, `npm run dev:admin` và `npm run dev:api`. Xem [hướng dẫn MySQL](docs/MYSQL-SETUP.md), [bàn giao](docs/IMPLEMENTATION_HANDOFF.md) và [tiến độ](docs/PROGRESS.md). Không commit tệp môi trường thực.

API hiện cung cấp health; identity/CQRS đang được xây dựng, chưa có API đăng nhập công khai hoặc phân quyền tenant hoàn chỉnh. Không sử dụng như hệ thống production.
