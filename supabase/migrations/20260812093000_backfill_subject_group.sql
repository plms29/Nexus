-- Gán lại subject_group cho workmap_entries dựa trên môn học của task.
-- Trước đây mọi mục workmap đều bị ghi cứng 'natural' trong autoScheduleTask,
-- khiến tỷ lệ 70/30 giữa hai ban không thể tính đúng.
UPDATE public.workmap_entries w
SET subject_group = CASE
  WHEN t.subject_id ILIKE ANY (ARRAY[
    '%văn%', '%sử%', '%địa%', '%anh%', '%english%',
    '%gdcd%', '%ktpl%', '%gdkt%', '%kinh tế%', '%pháp luật%', '%ngoại ngữ%'
  ]) THEN 'social'
  ELSE 'natural'
END
FROM public.tasks t
WHERE w.task_id = t.id;
