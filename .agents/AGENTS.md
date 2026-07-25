<!-- BEGIN:grill-me-rule -->
# /grill-me Custom Behavior

Khi người dùng gọi lệnh /grill-me, tuyệt đối KHÔNG sử dụng công cụ ask_question (interactive UI tool) để hỏi. Thay vào đó, hãy in các câu hỏi trực tiếp dưới dạng văn bản (text) trên cửa sổ trò chuyện để người dùng có thể đọc và trả lời thẳng trên cửa sổ chat.
<!-- END:grill-me-rule -->

<!-- BEGIN:database-rule -->
# Quy tắc làm việc với Database (Supabase)

1. Không bao giờ fallback về local storage khi thiếu bảng (không được tự ý chạy local bypass).
2. Nếu phát hiện bảng chưa tồn tại hoặc schema bị thiếu, BẮT BUỘC phải cung cấp mã SQL DDL (Data Definition Language) rõ ràng cho người dùng để họ có thể tự dán lên Supabase SQL Editor.
<!-- END:database-rule -->

<!-- BEGIN:skills-auto-routing-rule -->
# Quy Tắc Tự Động Định Tuyến & Kích Hoạt Skills (Design & UI/UX Skills)

Khi người dùng đưa ra bất kỳ yêu cầu nào liên quan đến Thiết kế, Lập trình Giao diện, Thương hiệu, Banner, Logo hoặc Thuyết trình, AI BẮT BUỘC phải tự động phân tích ý định và kích hoạt đúng Skill tương ứng trong `.agents/skills` mà người dùng không cần phải chỉ định thủ công:

1. **Lập trình Component / Giao diện UI (Tailwind CSS, shadcn/ui)**:
   - **Tự động chọn Skill**: `ui-styling` (`d:\Nexus\.agents\skills\ui-styling\SKILL.md`)
   - **Áp dụng khi**: Viết code TSX/JSX, tạo component, Modal, Form, Table, Dashboard, chỉnh CSS/Tailwind layout.

2. **Tư vấn Thiết kế UI/UX, Bảng màu, Font chữ, UX Writing**:
   - **Tự động chọn Skill**: `ui-ux-pro-max` (`d:\Nexus\.agents\skills\ui-ux-pro-max\SKILL.md`)
   - **Áp dụng khi**: Đề xuất phong cách thiết kế, chọn phối màu Palette, chọn cặp font Google Fonts, cải thiện trải nghiệm đọc và tương tác.

3. **Hệ thống Thiết kế & Biến CSS Tokens (Design System)**:
   - **Tự động chọn Skill**: `design-system` (`d:\Nexus\.agents\skills\design-system\SKILL.md`)
   - **Áp dụng khi**: Xây dựng/cập nhật CSS Root variables (`--primary`, `--background`), Spacing scale, Light/Dark mode tokens.

4. **Nhận diện Thương hiệu & Tone of Voice**:
   - **Tự động chọn Skill**: `brand` (`d:\Nexus\.agents\skills\brand\SKILL.md`)
   - **Áp dụng khi**: Định hình thương hiệu, thiết lập văn phong giao tiếp, chuẩn hóa tài sản thương hiệu.

5. **Thiết kế Banner, Cover Social, Header, Ad Banners**:
   - **Tự động chọn Skill**: `banner-design` (`d:\Nexus\.agents\skills\banner-design\SKILL.md`)
   - **Áp dụng khi**: Làm banner Facebook, LinkedIn, Twitter/X, Website Hero image, Google Display Ads.

6. **Sáng tạo Logo AI, CIP Doanh nghiệp, SVG Vector Icons**:
   - **Tự động chọn Skill**: `design` (`d:\Nexus\.agents\skills\design\SKILL.md`)
   - **Áp dụng khi**: Sáng tạo Logo AI, danh thiếp/phẩm vật văn phòng CIP, thiết kế SVG icons.

7. **Bài Thuyết Trình & Pitch Deck (Slides HTML)**:
   - **Tự động chọn Skill**: `slides` (`d:\Nexus\.agents\skills\slides\SKILL.md`)
   - **Áp dụng khi**: Tạo slide báo cáo, presentation, pitch deck gọi vốn dạng HTML tương tác có Chart.js.
<!-- END:skills-auto-routing-rule -->
