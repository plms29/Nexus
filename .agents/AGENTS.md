<!-- BEGIN:grill-me-rule -->
# /grill-me Custom Behavior

Khi người dùng gọi lệnh /grill-me, tuyệt đối KHÔNG sử dụng công cụ sk_question (interactive UI tool) để hỏi. Thay vào đó, hãy in các câu hỏi trực tiếp dưới dạng văn bản (text) trên cửa sổ trò chuyện để người dùng có thể đọc và trả lời thẳng trên cửa sổ chat.
<!-- END:grill-me-rule -->

<!-- BEGIN:database-rule -->
# Quy tắc làm việc với Database (Supabase)

1. Không bao giờ fallback về local storage khi thiếu bảng (không được tự ý chạy local bypass).
2. Nếu phát hiện bảng chưa tồn tại hoặc schema bị thiếu, BẮT BUỘC phải cung cấp mã SQL DDL (Data Definition Language) rõ ràng cho người dùng để họ có thể tự dán lên Supabase SQL Editor.
<!-- END:database-rule -->
