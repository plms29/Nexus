'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  GraduationCap, UserCheck, BookOpen, Sparkles, 
  ArrowRight, ShieldCheck, CheckCircle2, Loader2, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function SelectRolePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          // If unauthenticated, redirect to login
          router.replace('/login');
          return;
        }

        setUser(currentUser);

        // Check if user already registered a role
        const { data: dbUser } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (dbUser?.role) {
          if (dbUser.role === 'teacher') router.replace('/teacher/onboarding/step-1');
          else if (dbUser.role === 'student') router.replace('/student');
          else if (dbUser.role === 'admin') router.replace('/admin');
          return;
        }
      } catch (err: any) {
        console.error('Fetch user error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleRoleSelection = async (role: 'teacher' | 'student') => {
    if (!user || submitting) return;

    setSelectedRole(role);
    setSubmitting(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        role: role,
      }, { onConflict: 'id' });

      if (dbError) {
        console.error('Supabase DB error saving user role:', dbError);
        throw new Error(`Không thể lưu vai trò vào cơ sở dữ liệu: ${dbError.message}`);
      }

      await supabase.auth.updateUser({
        data: { role: role }
      });

      if (role === 'teacher') {
        window.location.href = '/teacher/onboarding/step-1';
      } else {
        window.location.href = '/student';
      }

    } catch (err: any) {
      console.error('Failed to set role:', err);
      setError(err.message || 'Có lỗi xảy ra khi lưu vai trò. Vui lòng thử lại!');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-300 font-medium text-sm">Đang chuẩn bị hồ sơ đăng ký...</p>
      </div>
    );
  }

  const userEmail = user?.email || '';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Lighting Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <nav className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">ExamLoad Radar</span>
        </div>

        {/* User Quick Info */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          <img src={userAvatar} alt="Google Profile" className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/50" />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{userName}</div>
            <div className="text-[10px] text-slate-400 font-medium">{userEmail}</div>
          </div>
          <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Gmail Verified
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Đăng Ký Tài Khoản Mới Với Gmail Auth
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Chào mừng bạn! Bạn là <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Giáo viên</span> hay <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Học sinh</span>?
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Vui lòng chọn vai trò phù hợp để hệ thống thiết lập lộ trình làm việc & phân quyền công cụ chính xác cho bạn.
          </p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center gap-3 font-semibold max-w-2xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Role Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {/* Card 1: Giáo viên */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !submitting && handleRoleSelection('teacher')}
            className={clsx(
              "relative bg-slate-900/80 border rounded-3xl p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl",
              selectedRole === 'teacher' && submitting
                ? "border-blue-500 ring-2 ring-blue-500/50 bg-blue-950/30"
                : "border-slate-800 hover:border-indigo-500/60 hover:shadow-indigo-500/10 hover:bg-slate-900"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                  Dành cho Thầy / Cô
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 group-hover:text-indigo-300 transition-colors">
                Giáo Viên Trung Học
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                Tạo và quản lý bài tập, ngân hàng câu hỏi, kiểm soát ma trận đề thi và theo dõi khối lượng học tập (ExamLoad) của các lớp.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Thiết lập bài tập Trắc nghiệm / Tự luận</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Ma trận câu hỏi AI L1 - L4</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Radar cảnh báo quá tải học sinh</span>
                </li>
              </ul>
            </div>

            <button
              disabled={submitting}
              className={clsx(
                "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md",
                submitting && selectedRole === 'teacher'
                  ? "bg-indigo-600 text-white cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 group-hover:shadow-lg"
              )}
            >
              {submitting && selectedRole === 'teacher' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo tài khoản Giáo viên...</span>
                </>
              ) : (
                <>
                  <span>Chọn Vai Trò Giáo Viên</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>

          {/* Card 2: Học sinh */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !submitting && handleRoleSelection('student')}
            className={clsx(
              "relative bg-slate-900/80 border rounded-3xl p-8 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-xl",
              selectedRole === 'student' && submitting
                ? "border-cyan-500 ring-2 ring-cyan-500/50 bg-cyan-950/30"
                : "border-slate-800 hover:border-cyan-500/60 hover:shadow-cyan-500/10 hover:bg-slate-900"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white">
                  <UserCheck className="w-7 h-7" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full">
                  Dành cho Học Sinh
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Học Sinh Trung Học
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                Xem lịch nộp bài tập, làm bài trực tuyến, phân tích lộ trình học tập cá nhân và xem mức độ áp lực ExamLoad của lớp.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Làm bài trực tuyến & nộp tự luận</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Cá nhân hóa theo Lớp học & Trường</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Biểu đồ thời gian làm bài chuẩn xác</span>
                </li>
              </ul>
            </div>

            <button
              disabled={submitting}
              className={clsx(
                "w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md",
                submitting && selectedRole === 'student'
                  ? "bg-cyan-600 text-white cursor-wait"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30 group-hover:shadow-lg"
              )}
            >
              {submitting && selectedRole === 'student' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang khởi tạo tài khoản Học sinh...</span>
                </>
              ) : (
                <>
                  <span>Chọn Vai Trò Học Sinh</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4">
        <p className="text-xs text-slate-500 font-medium">
          &copy; 2026 ExamLoad Radar. Bảo mật thông tin qua Supabase Auth E2E encryption.
        </p>
      </footer>
    </div>
  );
}
