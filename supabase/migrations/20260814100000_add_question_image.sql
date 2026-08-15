-- Cho phép mỗi câu hỏi đính kèm 1 ảnh minh họa (đề bài thực tế, biểu đồ, hình vẽ...)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Bucket public chứa ảnh đề bài
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies cho bucket question-images
DROP POLICY IF EXISTS "Public read question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update question images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete question images" ON storage.objects;

CREATE POLICY "Public read question images" ON storage.objects
  FOR SELECT USING ( bucket_id = 'question-images' );

CREATE POLICY "Anyone can upload question images" ON storage.objects
  FOR INSERT WITH CHECK ( bucket_id = 'question-images' );

CREATE POLICY "Anyone can update question images" ON storage.objects
  FOR UPDATE USING ( bucket_id = 'question-images' );

CREATE POLICY "Anyone can delete question images" ON storage.objects
  FOR DELETE USING ( bucket_id = 'question-images' );
