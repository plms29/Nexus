-- Migration to add student profile fields (school, province, avatar) to users and teacher_profiles tables
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS school TEXT DEFAULT 'THPT Chuyên Lê Quý Đôn',
ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'Đà Nẵng',
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4';

ALTER TABLE public.teacher_profiles
ADD COLUMN IF NOT EXISTS province TEXT DEFAULT 'Đà Nẵng';
