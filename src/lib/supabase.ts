import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Đã cấu hình đủ biến môi trường để gọi Supabase thật hay chưa */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// createClient ném lỗi ngay khi thiếu URL/key, làm bước prerender lúc build sập
// nếu môi trường build chưa có biến môi trường (ví dụ lần deploy đầu trên Vercel).
// Dùng giá trị giữ chỗ để build luôn chạy được; mọi request thật vẫn cần env đúng.
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

if (!isSupabaseConfigured) {
  console.warn(
    'Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Ứng dụng vẫn build được nhưng mọi truy vấn Supabase sẽ lỗi cho tới khi cấu hình đủ biến môi trường.'
  );
}

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient(supabaseUrl || PLACEHOLDER_URL, supabaseAnonKey || PLACEHOLDER_KEY);

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase;
