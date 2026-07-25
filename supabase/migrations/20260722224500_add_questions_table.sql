-- Create questions table linked to tasks
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'l1',
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow policies for select/insert/update/delete
DROP POLICY IF EXISTS "Users can view questions" ON public.questions;
DROP POLICY IF EXISTS "Users can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions" ON public.questions;

CREATE POLICY "Users can view questions" ON public.questions FOR SELECT USING ( true );
CREATE POLICY "Users can insert questions" ON public.questions FOR INSERT WITH CHECK ( true );
CREATE POLICY "Users can update questions" ON public.questions FOR UPDATE USING ( true );
CREATE POLICY "Users can delete questions" ON public.questions FOR DELETE USING ( true );
