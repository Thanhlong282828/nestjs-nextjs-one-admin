# Quy tắc database Aurum

NestJS là backend duy nhất truy cập database nghiệp vụ qua Prisma. Một chức năng chỉ được xem là hoàn thiện khi có schema/migration, validation, authorization company/branch phía server, persistence, API, kiểm thử và UI phù hợp. Không hard-code KPI hoặc tuyên bố CRUD nếu không lưu dữ liệu. Thay đổi schema phải kiểm thử trên database test trước và đánh giá backup/rollout trước khi áp vào development/production.

Seed development phải chạy chủ động, kiểm tra môi trường, tài khoản, quyền và database sau kết nối; không update, xóa hoặc ghi đè dữ liệu khác. Chỉ áp dụng cho development local được cho phép; production không được seed demo. Không có lệnh DROP, TRUNCATE hoặc reset mặc định. Thao tác phá hủy cần xác nhận riêng. Không commit secrets, dữ liệu khách hàng; không dùng tài khoản quản trị cho ứng dụng và không đưa credentials vào frontend.

Tính năng login, authorization, API company và dashboard dữ liệu vẫn chưa hoàn thiện. Không mở dữ liệu riêng tư trước khi xác thực và phân quyền được thực thi và kiểm thử.
