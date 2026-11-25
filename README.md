# Aurum Admin

Giao diện quản trị đang phát triển; chưa có đăng nhập hoặc kết nối dữ liệu thật.

Ứng dụng Next.js độc lập. NestJS API được quản lý và triển khai riêng, không nằm trong repository này. Không lưu database credentials hoặc dữ liệu khách hàng trong frontend.

Yêu cầu Node.js 24.13.1 và npm 10.9.4.

```sh
npm ci
npm run dev # http://localhost:3000
```

Kiểm tra: `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit`. Không xem ứng dụng là production-ready khi chưa có API, xác thực và kiểm thử tương ứng.

Mã nguồn gốc đang phát triển trong monorepo; repository này là bản tách tại thời điểm publish, không tự đồng bộ với monorepo.
