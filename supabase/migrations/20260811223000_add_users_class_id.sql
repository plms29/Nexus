-- Add or fix class_id on users to TEXT (must match tasks.class_id format like 10A1)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_class;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'class_id'
  ) THEN
    ALTER TABLE public.users ALTER COLUMN class_id TYPE TEXT USING class_id::text;
  ELSE
    ALTER TABLE public.users ADD COLUMN class_id TEXT;
  END IF;
END $$;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS school TEXT DEFAULT 'THPT Chuyên Lê Quý Đôn',
ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'Đà Nẵng',
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4';

CREATE INDEX IF NOT EXISTS idx_users_class_id ON public.users (class_id);
CREATE INDEX IF NOT EXISTS idx_tasks_class_id ON public.tasks (class_id);
