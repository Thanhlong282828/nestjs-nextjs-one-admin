# Media và tài liệu

## Yêu cầu sản phẩm

- Ảnh: Cloudflare Images. Cần thiết kế chế độ private/signed delivery phù hợp loại ảnh và phân quyền, không mặc định ảnh chứa dữ liệu nhân sự được công khai.
- Tài liệu: Supabase Storage qua S3-compatible API, bucket private, khóa ngẫu nhiên theo company/branch; cấp quyền download ở server sau khi kiểm tra access, với URL ngắn hạn nếu phù hợp.
- Quét malware bằng ClamAV trước khi đưa vào provider; dịch vụ quét lỗi, quá hạn hoặc trả kết quả không xác định thì từ chối upload. Không tự chuyển provider khi provider dự kiến lỗi.

## Đã có

`packages/media` là thư viện nghiệp vụ ban đầu: command/handler, contract scanner và storage; kiểm tra permission contract, định dạng UUID scope, giới hạn 10 MiB, chữ ký cơ bản PNG/JPEG/PDF, định tuyến ảnh/tài liệu, SHA-256 và fail-closed với scanner lỗi hoặc kết quả khác `clean`. Tests dùng scanner/storage giả. Không có API hay giao diện upload. Actor chỉ là dữ liệu đầu vào của thư viện, chưa được xác thực và chưa chứng minh quyền chi nhánh.

## Chưa có — không dùng cho dữ liệu thật

- Chưa có adapter ClamAV, Cloudflare Images, Supabase S3, credentials, bucket hay upload thật. Chưa kiểm thử với EICAR hoặc dịch vụ thực.
- Chữ ký đầu tệp không chứng minh tệp hợp lệ hay an toàn; cần parser/decoder, giới hạn pixel/giải nén và chính sách metadata/polyglot, đồng thời thực thi timeout và giới hạn tài nguyên đối với scanner và adapter.
- Cần authentication, RBAC và branch scope phía server; không nhận actor/permission từ client. Thiết kế lưu metadata và audit có transaction/outbox, xóa object mồ côi, retry idempotent và kiểm thử ngăn truy cập chéo company/branch.
- Cần xác minh Cloudflare Images cho ảnh private, S3 endpoint và hành vi signed URL của Supabase trên tài khoản thực; không lưu secret vào repo, log hoặc client. Không mặc định ảnh có thể được lưu chỉ với object key giống S3: adapter phải ánh xạ ID do provider cấp an toàn.
- Cần giới hạn upload ngay tại HTTP/proxy và stream có giới hạn trước khi cấp phát buffer, isolation mạng cho ClamAV, cập nhật chữ ký virus, readiness và giám sát; không tin client MIME hay tên file. Cần test provider lỗi, scanner timeout, tệp độc, quyền truy cập, concurrency và rollback với môi trường test riêng.
