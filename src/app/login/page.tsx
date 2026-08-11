'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, BookOpen, ChevronLeft, ShieldCheck, Sparkles, UserCheck, 
  GraduationCap, CheckCircle2, User, Lock, Mail, ArrowRight 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Shared form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>('student');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'signup' || searchParams.get('mode') === 'signup') {
      setAuthMode('signup');
    }
  }, [searchParams]);

  // Handle Login with Email & Password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      let userRole = 'student';
      const cleanEmail = email.trim().toLowerCase();

      if (cleanEmail.includes('student')) {
        userRole = 'student';
      } else if (cleanEmail.includes('admin')) {
        userRole = 'admin';
      } else if (cleanEmail.includes('teacher')) {
        userRole = 'teacher';
      } else {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (userData?.role) {
            userRole = userData.role;
          } else if (data?.user?.user_metadata?.role) {
            userRole = data.user.user_metadata.role;
          }
        } catch (dbErr) {
          console.warn('Could not query users table, fallback to role:', userRole);
        }
      }

      if (userRole === 'student') {
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            role: 'student',
            name: data.user.user_metadata?.name || 'Học sinh Nexus',
            class_id: data.user.user_metadata?.class_id || '10A5',
            school: data.user.user_metadata?.school || 'THPT Chuyên Lê Quý Đôn',
            province: data.user.user_metadata?.province || 'Đà Nẵng',
            avatar: data.user.user_metadata?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4'
          }, { onConflict: 'id' });
        } catch (dbSaveErr) {
          console.warn('Auto-save student record on login error:', dbSaveErr);
        }
        window.location.href = '/student';
      } else if (userRole === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/teacher';
      }

    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.');
      setLoading(false);
    }
  };

  // Handle Signup with Email & Password + Role Selection
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên của bạn.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không trùng khớp. Vui lòng kiểm tra lại!');
      setLoading(false);
      return;
    }

    try {
      const finalName = fullName.trim();
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalName)}&backgroundColor=b6e3f4`;

      // 1. Sign up on Supabase Auth with redirect URL for email verification link
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            name: finalName,
            role: selectedRole,
            avatar: avatarUrl
          }
        }
      });

      let activeUser = signUpData?.user;

      if (signUpError) {
        // If Supabase blocked sending email due to rate limit, attempt instant login fallback
        console.warn('SignUp returned error, trying instant login fallback:', signUpError.message);
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (!signInError && signInData?.user) {
          activeUser = signInData.user;
        } else {
          throw signUpError;
        }
      }

      if (!activeUser) {
        throw new Error('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }

      const { error: dbError } = await supabase.from('users').upsert({
        id: activeUser.id,
        email: activeUser.email || email.trim(),
        name: finalName,
        role: selectedRole,
        avatar: avatarUrl,
      }, { onConflict: 'id' });

      if (dbError) {
        console.warn('DB record creation warning:', dbError.message);
      }

      setSuccessMsg('Đăng ký thành công! Vui lòng điền thông tin cá nhân...');

      setTimeout(() => {
        if (selectedRole === 'teacher') {
          window.location.href = '/teacher/onboarding/step-1';
        } else {
          window.location.href = '/student';
        }
      }, 800);

    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại hoặc không hợp lệ.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      {/* Left Panel - Branding Graphic */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/50 blur-[120px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/50 blur-[100px] rounded-full pointer-events-none" 
        />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-2"
        >
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">ExamLoad Radar</span>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 max-w-md"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-200" />
            Nền tảng Quản lý Đề thi & Khối lượng học tập
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Học tập hiệu quả hơn, <br /> giảng dạy thông minh hơn.
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-blue-100 text-lg leading-relaxed mb-10">
            Hệ sinh thái phân quyền độc đáo hỗ trợ Giáo viên thiết lập bài tập khoa học và Giúp Học sinh kiểm soát áp lực thi cử.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="relative h-40">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 w-64 shadow-2xl"
            >
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Supabase Database</div>
                <div className="text-blue-200 text-xs">Mã hóa mật khẩu an toàn</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-16 left-24 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 w-64 shadow-2xl"
            >
              <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Phân quyền vai trò</div>
                <div className="text-blue-200 text-xs">Giáo viên & Học sinh</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10"
        >
          <p className="text-blue-200/70 text-sm">
            &copy; 2026 ExamLoad Radar. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 relative py-12 bg-white">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Trang chủ
        </Link>

        <div className="w-full max-w-md mx-auto">
          {/* Header & Tab Switcher */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {authMode === 'login' ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới 🚀'}
            </h2>
            <p className="text-slate-600 text-sm font-medium mb-6">
              {authMode === 'login' 
                ? 'Đăng nhập bằng Email & Mật khẩu để tiếp tục' 
                : 'Đăng ký tài khoản Supabase với vai trò mong muốn'}
            </p>

            {/* Segmented Tab Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }}
                className={clsx(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all duration-200 cursor-pointer",
                  authMode === 'login'
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(null); setSuccessMsg(null); }}
                className={clsx(
                  "flex-1 py-3 text-sm font-black rounded-xl transition-all duration-200 cursor-pointer",
                  authMode === 'signup'
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                Đăng Ký Mới
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl font-medium"
            >
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Form Switcher */}
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              /* LOGIN FORM */
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin} 
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Email Tài Khoản
                  </Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="teacher@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                      Mật Khẩu
                    </Label>
                    <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-blue-500/25 border-none mt-2" 
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Đăng Nhập'}
                </Button>
              </motion.form>
            ) : (
              /* SIGNUP FORM */
              <motion.form 
                key="signup-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSignUp} 
                className="space-y-5"
              >
                {/* Role Selection Cards */}
                <div>
                  <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider block mb-2">
                    Chọn Vai Trò Của Bạn:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Role Teacher */}
                    <div
                      onClick={() => setSelectedRole('teacher')}
                      className={clsx(
                        "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs",
                        selectedRole === 'teacher'
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/30 text-indigo-900"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center shadow-xs",
                        selectedRole === 'teacher' ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-sm">Giáo Viên</span>
                      <span className="text-[10px] text-slate-500 font-medium">Soạn đề & Quản lý lớp</span>
                    </div>

                    {/* Role Student */}
                    <div
                      onClick={() => setSelectedRole('student')}
                      className={clsx(
                        "p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs",
                        selectedRole === 'student'
                          ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30 text-blue-900"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center shadow-xs",
                        selectedRole === 'student' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-sm">Học Sinh</span>
                      <span className="text-[10px] text-slate-500 font-medium">Làm bài & Theo dõi Radar</span>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Họ và Tên
                  </Label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={selectedRole === 'teacher' ? 'Ví dụ: Thầy Nguyễn Văn A' : 'Ví dụ: Nguyễn Văn Học'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5 font-semibold"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Email Đăng Ký
                  </Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5 font-semibold"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Mật Khẩu (Tối thiểu 6 ký tự)
                  </Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5 font-semibold"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="signup-confirm-password" className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                    Nhập Lại Mật Khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={clsx(
                        "bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl pl-11 py-5 font-semibold",
                        confirmPassword && confirmPassword !== password && "border-rose-400 focus-visible:ring-rose-500 bg-rose-50/20"
                      )}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1">Mật khẩu nhập lại chưa trùng khớp</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-indigo-500/25 border-none mt-2 flex items-center justify-center gap-2" 
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Đăng Ký Tài Khoản {selectedRole === 'teacher' ? 'Giáo Viên' : 'Học Sinh'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
