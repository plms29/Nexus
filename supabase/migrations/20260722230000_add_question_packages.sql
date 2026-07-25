-- Create question_packages table
CREATE TABLE IF NOT EXISTS public.question_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Toán',
  grade_class TEXT NOT NULL DEFAULT '10A',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for question_packages
ALTER TABLE public.question_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view packages" ON public.question_packages;
DROP POLICY IF EXISTS "Users can insert packages" ON public.question_packages;
DROP POLICY IF EXISTS "Users can update packages" ON public.question_packages;
DROP POLICY IF EXISTS "Users can delete packages" ON public.question_packages;

CREATE POLICY "Users can view packages" ON public.question_packages FOR SELECT USING ( true );
CREATE POLICY "Users can insert packages" ON public.question_packages FOR INSERT WITH CHECK ( true );
CREATE POLICY "Users can update packages" ON public.question_packages FOR UPDATE USING ( true );
CREATE POLICY "Users can delete packages" ON public.question_packages FOR DELETE USING ( true );

-- Add package_id to questions table and make task_id optional
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.question_packages(id) ON DELETE CASCADE;
ALTER TABLE public.questions ALTER COLUMN task_id DROP NOT NULL;
