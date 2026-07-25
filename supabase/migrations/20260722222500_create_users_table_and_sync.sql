-- 1. Create users table if not exists
CREATE TABLE IF NOT EXISTS public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  role text not null default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own row" ON public.users;

-- 4. Create policies
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Users can insert own row" ON public.users FOR INSERT WITH CHECK ( auth.uid() = id );

-- 5. Sync existing accounts from auth.users to public.users
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin User', 'admin' FROM auth.users WHERE email = 'admin@school.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Teacher User', 'teacher' FROM auth.users WHERE email = 'teacher@school.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Student User', 'student' FROM auth.users WHERE email = 'student@school.com'
ON CONFLICT (id) DO NOTHING;
