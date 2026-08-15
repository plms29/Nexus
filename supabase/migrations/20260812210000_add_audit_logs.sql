-- Nhật ký ghi đè cảnh báo quá tải.
-- Theo tài liệu: vượt ngưỡng nặng thì giáo viên vẫn giao được nhưng phải nêu lý do,
-- và lý do đó phải trình bày được cho nhà trường -> cần lưu lại thay vì chỉ console.log.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT,
  task_title TEXT NOT NULL,
  teacher_id UUID,
  teacher_name TEXT,
  class_id TEXT,
  subject_id TEXT,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'soft' CHECK (severity IN ('critical', 'soft')),
  -- Số phút vượt ngưỡng 5 LU/ngày tại thời điểm ghi đè
  excess_minutes NUMERIC,
  deadline TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_class_id ON public.audit_logs (class_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can insert audit logs" ON public.audit_logs;

CREATE POLICY "Users can view audit logs" ON public.audit_logs FOR SELECT USING ( true );
CREATE POLICY "Users can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK ( true );
