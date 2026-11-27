# ADR 0004 — Shared locale foundation

Các ứng dụng và module dùng một workspace `@aurum/i18n` cho registry, lựa chọn locale và formatter thuần, không phụ thuộc Next hay Nest. vi/en là locale hỗ trợ; mặc định vi. Thứ tự user > branch > company > local > default chỉ là quy tắc lựa chọn, caller phải xác thực nguồn và tenant. Formatter không tính tiền, không đổi dữ liệu. Chưa nối HTTP, UI hay persistence; chưa cam kết i18n đã hoàn tất. Phải mở rộng catalogs và kiểm tra placeholder/coverage trước khi chuyển chuỗi UI, tránh giao diện lai và tránh lộ dữ liệu qua preference không được ủy quyền.

Update 06.10.1: project owner changed precedence to user > company > branch > local > default; this supersedes the earlier order above. Server sources remain unimplemented.
