'use client';

import { useTranslate } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Sparkles, BookOpen } from 'lucide-react';

export default function AuthCallbackPage() {
  const tr = useTranslate();
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState('Đang xác thực thông tin tài khoản Google...');

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Wait briefly for Supabase JS SDK to sync session from OAuth redirect URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        const currentUser = session?.user || (await supabase.auth.getUser()).data.user;

        if (!currentUser) {
          // Listen once for auth state change if session hasn't completed sync
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (currentSession?.user && isMounted) {
              await checkUserRoleAndRedirect(currentSession.user);
              authListener.subscription.unsubscribe();
            }
          });

          // Fallback timeout
          setTimeout(() => {
            if (isMounted) {
              router.replace('/login');
            }
          }, 4000);
          return;
        }

        if (isMounted) {
          await checkUserRoleAndRedirect(currentUser);
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        if (isMounted) router.replace('/login');
      }
    };

    const checkUserRoleAndRedirect = async (user: any) => {
      setStatusMessage('Kiểm tra quyền truy cập hệ thống...');
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Error fetching user role from database:', error.message);
        }

        let userRole = data?.role;

        // Fallback to user_metadata if present
        if (!userRole && user.user_metadata?.role) {
          userRole = user.user_metadata.role;
        }

        if (userRole === 'teacher') {
          router.replace('/teacher');
        } else if (userRole === 'student') {
          router.replace('/student');
        } else if (userRole === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/auth/select-role');
        }
      } catch (err) {
        console.error('Role check error:', err);
        router.replace('/auth/select-role');
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Animated Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
          <BookOpen className="w-8 h-8 text-white" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 text-blue-400 font-semibold text-sm">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>ExamLoad Radar Auth</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-3">
          {tr("Đang kết nối Gmail Auth")}
        </h2>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed font-medium">
          {statusMessage}
        </p>

        <div className="flex justify-center items-center gap-3 bg-white/5 py-3 px-4 rounded-xl border border-white/10 text-slate-200 text-xs font-semibold">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span>{tr("Vui lòng đợi trong giây lát...")}</span>
        </div>
      </div>
    </div>
  );
}
