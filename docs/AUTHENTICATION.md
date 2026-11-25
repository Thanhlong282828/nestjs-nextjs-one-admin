# Identity và session — trạng thái thực tế

Checkpoint 2026-11-25: dự án **chưa có đăng nhập sử dụng được**, chưa có tài khoản ứng dụng được tạo và chưa bảo vệ API nghiệp vụ bằng RBAC. Không dùng trạng thái này cho production.

## Thành phần đã xây dựng

- `@aurum/identity` có hàm Argon2id và `SessionService`. Session dùng token ngẫu nhiên 32 byte; chỉ hash SHA-256 được lưu, mặc định hết hạn sau tám giờ. Xác thực kiểm tra hết hạn, thu hồi và trạng thái user hiện tại. Thu hồi từng session được giới hạn theo user; có thể thu hồi tất cả session của user.
- `PrismaSessionStore` triển khai lưu trữ bằng MySQL. Schema và migration session đã chạy trên `aurum_nestjs_test`, chưa chạy trên database ứng dụng `aurum_nestjs`. Không có endpoint hay Nest provider nào sử dụng adapter này.
- Unit test dùng store trong bộ nhớ; integration test dùng MySQL test riêng và transaction rollback, kiểm tra lưu hash, hết hạn, vô hiệu hóa user, thu hồi và giới hạn chủ sở hữu. Đây không phải kiểm thử đăng nhập HTTP hoặc trình duyệt.

## Điều kiện cần trước khi mở chức năng

1. Thiết kế và kiểm thử quy trình tạo tài khoản, xác minh mật khẩu, xử lý lỗi đồng nhất, giới hạn tốc độ và đăng nhập đồng thời; không seed mật khẩu yếu vào production.
2. Tích hợp session vào Nest qua module và use case, chính sách cookie HttpOnly/Secure/SameSite, HTTPS, CSRF, logout, rotation và kiểm thử hành vi lỗi. Không tin user ID do client cung cấp; không ghi token hoặc password vào log.
3. Tải membership, role, permission và phạm vi company/branch từ nguồn tin cậy phía server; thực thi ở mọi query/command và kiểm thử IDOR, quyền bị thu hồi và thay đổi trạng thái. Policy hiện có chưa được tích hợp.
4. Kiểm thử migration fresh và upgrade, cấp quyền app tối thiểu, chuẩn bị backup và rollout trước khi thay đổi database ứng dụng. Không reset hoặc xóa dữ liệu. Thêm UI đăng nhập, accessibility và kiểm thử end-to-end sau khi API sẵn sàng.
5. Đánh giá recovery/MFA, audit và kiểm thử bảo mật phù hợp; xử lý audit dependency còn 3 high. GitHub Actions chưa được xác nhận chạy với batch này.

Không commit `.env.mysql`, mật khẩu, token hoặc dữ liệu khách hàng. Test fixtures chỉ tồn tại trong database thử nghiệm riêng.

## Capability matrix — batch 02 continuation

| Năng lực | Implemented | Tested | Integrated | Production ready | Blocked / còn thiếu |
| --- | --- | --- | --- | --- | --- |
| Argon2id | Có | Unit | Không | Không | Chưa có login hoặc rate limit |
| Session store | Có | Unit và MySQL test trước đó | Không | Không | Thiếu HTTP/cookie/CSRF và đánh giá concurrency |
| Logout, logout all | CQRS handler | Unit | Không | Không | Chưa có controller, CSRF, audit, integration/E2E và kiểm thử race |
| Login, refresh, reset, MFA | Không | Không | Không | Không | Chưa triển khai |
| RBAC, company, branch | Policy/schema một phần | Unit và FK test trước đó | Không | Không | Thiếu quyền trong DB và enforcement API |

Logout handlers chỉ là use case nội bộ: transport phải xác thực origin/CSRF, không log token; cần đánh giá cạnh tranh giữa xác thực và thu hồi trước khi sử dụng. Các kết quả kiểm thử MySQL nêu trên là checkpoint trước, không phải test mới của handler.

Batch 03 preflight xác nhận database demo chưa có user, membership hoặc session. Chưa có API đăng nhập hoặc nguồn principal từ server; không dùng các truy vấn company nội bộ làm endpoint cho đến khi các điều kiện xác thực, RBAC và tenant được thực thi và kiểm thử. Quyền `nestjs` tại demo đã giảm còn SELECT bảng companies, chưa có quyền cho luồng auth.

## Batch 05 — đổi mật khẩu nội bộ

`ChangePasswordCommandHandler` xác minh token và mật khẩu cũ rồi băm Argon2id. Prisma adapter thực hiện cập nhật có điều kiện hash cũ phân biệt hoa thường, trạng thái active, session còn hạn/chưa thu hồi và thu hồi session trong transaction serializable. Unit và MySQL test riêng đã chạy; chưa có endpoint, chưa kiểm thử concurrent/deadlock/rollback lỗi, audit hay CSRF và chưa dùng trong môi trường thực. Sau khi đổi, người dùng cần xác thực lại vì tất cả session bị thu hồi.

## Batch 05 continuation — identity queries

Query lấy user và danh sách tối đa 100 session còn hoạt động đã có unit và MySQL test. Danh tính được suy ra từ token/session và không trả hash/token; adapter chưa nối API. Đây chưa phải đăng nhập, chưa bảo đảm chống race khi session/user bị thu hồi giữa các bước và chưa có device metadata. Không expose trước khi có security boundary và test phù hợp.

## Batch 05 continuation 02 — verifier và thu hồi phiên

`VerifyCredentials` có Prisma adapter xác minh Argon2id với dữ liệu thật trên MySQL test, trả user ID hoặc null; tài khoản thiếu dùng dummy hash, disabled không được chấp nhận. Chưa có giới hạn tốc độ, audit, transaction issuance hoặc đánh giá timing đầy đủ; không expose qua HTTP. `RevokeSessionCommandHandler` dùng actor từ token và ràng buộc chủ sở hữu; unit và integration test cross-user pass. Chưa có LoginCommand, login endpoint/UI, cookie, CSRF hoặc bootstrap. Không tuyên bố authentication hoàn chỉnh.

## CP1.2 — login engine nội bộ

`LoginCommandHandler` + `PrismaLoginStore` đã test MySQL: Argon2id, token ngẫu nhiên, chỉ lưu SHA-256, hết hạn, audit login success/failure và ràng buộc trạng thái/hash còn nguyên khi cấp session. Migration audit chỉ trên test. Login chưa được đăng ký Nest hay dùng qua browser; thiếu audit những thao tác khác, session rotation cũ, rate limit, CSRF, cookie và kiểm thử concurrency đầy đủ. Không mở HTTP trước khi hoàn tất các kiểm soát này.

## CP1.2.1 — session lifecycle và CQRS nội bộ

Login có thể xoay session cũ của cùng user trong transaction, tạo token mới và audit rotation; token user khác không bị thu hồi. Logout, logout-all, revoke và password change có adapter ghi audit cùng transaction; kiểm thử MySQL kiểm tra scope và rollback audit logout. IdentityModule động đăng ký CommandBus/QueryBus, đã kiểm thử với MySQL test nhưng chưa được lắp vào API. Chưa có cookie/CSRF/rate limit/HTTP/UI; chưa kiểm thử đầy đủ các race giữa đổi mật khẩu, revoke và login, hoặc rollback audit password change. Không coi CP1.2 hoàn chỉnh.

## CP1.2.2 — hardening và runtime

MySQL test đã kiểm tra password-audit failure rollback, expiration boundary, disable user và các thao tác đồng thời logout/logout-all/password change/rotation; test lặp lại ba lần thành công nhưng không chứng minh mọi interleaving. Nest HTTP app **thử nghiệm** khởi chạy module, CQRS hoạt động, đóng listener và `/auth/login` trả 404. IdentityModule nhận Prisma client do caller sở hữu; chưa test signal lifecycle hay application production. Audit transaction đã test tính nhất quán cho một số thao tác, chưa có tamper-evidence, retention hay phân quyền audit. Thiếu HTTP cookie/CSRF/rate limit/guard và RBAC thật; chưa đánh dấu CP1.2 hoàn tất.
