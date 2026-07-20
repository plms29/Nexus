create table public.teacher_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  school text not null,
  subject_group text not null,
  subjects jsonb not null,
  classes jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bật RLS (Row Level Security)
alter table public.teacher_profiles enable row level security;

-- Cho phép user đọc profile của chính họ
create policy "Users can view their own profile" on public.teacher_profiles for select using ( auth.uid() = id );

-- Cho phép user tự insert/update profile của mình
create policy "Users can insert their own profile" on public.teacher_profiles for insert with check ( auth.uid() = id );

create policy "Users can update their own profile" on public.teacher_profiles for update using ( auth.uid() = id );
