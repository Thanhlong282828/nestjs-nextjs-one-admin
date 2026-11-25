# Môi trường database

- `aurum_nestjs`: development local tại MySQL `127.0.0.1:3306`, app user `nestjs`. Hiện có hai công ty được đánh dấu `[DEMO]`; không coi là công ty thật.
- `aurum_nestjs_test`: chỉ kiểm thử tự động, không phải nguồn UI; test ghi transaction rollback.
- `aurum_nestjs_demo`: database demo riêng trước đây; không tự động chuyển API sang đây.
- Production: phải cấu hình riêng, chỉ chứa dữ liệu thật; seed development không hỗ trợ production.

Không tự động đổi DATABASE_URL. Credentials tại `.env.mysql` local bị gitignore. Hai môi trường database riêng không chứng minh cách ly server hay quyền đầy đủ; kiểm tra quyền MySQL thực tế trước khi chạy. Các bản ghi demo hiện nhận diện bằng tiền tố `[DEMO]` trong tên, chưa có cột is_demo; không dựa vào tên làm cơ chế bảo mật.
