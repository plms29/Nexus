-- Bài nhóm: lưu danh sách nhóm đã chia để học sinh thấy mình thuộc nhóm nào.
-- Đồng thời ghi tên giáo viên giao bài, để giáo viên bộ môn này thấy lớp đang
-- gánh bài của những thầy cô nào khi xem trước Workmap.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS teacher_name TEXT,
  ADD COLUMN IF NOT EXISTS student_groups JSONB;

-- Lớp thí điểm 12/22: tài khoản teacher@school.com là giáo viên Ngữ văn của lớp,
-- đưa 12/22 lên đầu danh sách lớp phụ trách để mở form giao bài là chọn sẵn.
INSERT INTO public.teacher_profiles (id, name, school, subject_group, subjects, classes)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', 'Teacher User'),
  'THPT Chuyên Lê Quý Đôn',
  'social',
  '["Ngữ văn"]'::jsonb,
  '["12/22"]'::jsonb
FROM auth.users u
WHERE u.email = 'teacher@school.com'
ON CONFLICT (id) DO UPDATE SET
  classes = '["12/22"]'::jsonb || (public.teacher_profiles.classes - '12/22'),
  subjects = CASE
    WHEN public.teacher_profiles.subjects ? 'Ngữ văn' THEN public.teacher_profiles.subjects
    ELSE '["Ngữ văn"]'::jsonb || public.teacher_profiles.subjects
  END,
  updated_at = timezone('utc'::text, now());

-- Tài khoản student@school.com là học sinh "Minh Khoa" trong sơ đồ lớp 12/22.
INSERT INTO public.users (id, email, name, role, class_id)
SELECT u.id, u.email, 'Minh Khoa', 'student', '12/22'
FROM auth.users u
WHERE u.email = 'student@school.com'
ON CONFLICT (id) DO UPDATE SET
  name = 'Minh Khoa',
  class_id = '12/22',
  role = 'student';

UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
  || '{"name": "Minh Khoa", "class_id": "12/22"}'::jsonb
WHERE email = 'student@school.com';
