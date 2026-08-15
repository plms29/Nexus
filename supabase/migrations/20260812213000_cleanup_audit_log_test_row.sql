-- Xoá bản ghi thử được tạo khi kiểm thử đường ghi audit log.
-- Bảng audit_logs cố ý KHÔNG có policy DELETE: nhật ký ghi đè phải bất biến
-- để còn trình bày được cho nhà trường, nên chỉ migration (quyền postgres) mới dọn được.
DELETE FROM public.audit_logs
WHERE task_title = 'Bài kiểm tra thử ghi audit log'
  AND task_id LIKE 'test-%';
