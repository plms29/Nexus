'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, ChevronLeft, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isDemoEmail = email.includes('admin') || email.includes('teacher') || email.includes('student');
      const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url';

      // Use mock login if Supabase is not configured, or if it's a demo email and password is empty or 'demo'
      if (isMockMode || (isDemoEmail && (!password || password === 'demo' || password === '123456' || password === 'password'))) {
        console.warn('Using mock login.');
        // Simulate network delay for nice button loading animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const isMockOnboardingDone = localStorage.getItem('examload_onboarding_done') === 'true';

        if (email.includes('admin')) router.push('/admin');
        else if (email.includes('teacher')) {
          if (isMockOnboardingDone) router.push('/teacher');
          else router.push('/teacher/onboarding/step-1');
        }
        else router.push('/student');
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (userError) throw userError;

      if (userData.role === 'admin') {
        router.push('/admin');
      } else if (userData.role === 'teacher') {
        const { data: profile, error: profileError } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        const isMockOnboardingDone = localStorage.getItem('examload_onboarding_done') === 'true';

        if (profile || (profileError?.code === 'PGRST205' && isMockOnboardingDone)) router.push('/teacher');
        else router.push('/teacher/onboarding/step-1');
      } else {
        router.push('/student');
      }

    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding/Graphic */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden flex-col justify-between p-12">
        {/* Animated Backgrounds */}
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
            Bảo mật & An toàn
          </motion.div>
          <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Học tập hiệu quả hơn, <br /> giảng dạy thông minh hơn.
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-blue-100 text-lg leading-relaxed mb-10">
            Hệ sinh thái phân quyền độc đáo giúp cá nhân hóa lộ trình học tập và tối ưu hóa thời gian soạn bài cho giáo viên Trung học Phổ thông.
          </motion.p>
          
          {/* Floating UI Elements */}
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
                <div className="text-white font-bold text-sm">Xác thực an toàn</div>
                <div className="text-blue-200 text-xs">Mã hóa đầu cuối E2E</div>
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
                <div className="text-white font-bold text-sm">Phân quyền thông minh</div>
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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 xl:px-32 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            href="/" 
            className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>
        </motion.div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm mx-auto"
        >
          <motion.div variants={fadeInUp} className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Chào mừng trở lại! 👋</h2>
            <p className="text-slate-600 text-sm font-medium">
              Đăng nhập vào tài khoản của bạn để tiếp tục
            </p>
          </motion.div>

          <motion.form variants={fadeInUp} onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl font-medium"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">Email</Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-xl px-4 py-6 transition-all group-hover:border-blue-300"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-bold">Mật khẩu</Label>
                <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-xl px-4 py-6 transition-all group-hover:border-blue-300"
                />
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-6 text-base font-bold shadow-lg shadow-blue-500/30 transition-all border-none" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Đăng nhập'}
              </Button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 mt-8 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700 mb-1 block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Tài khoản Demo (Prototype):
                </strong>
                Nhập Email chứa <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">&quot;admin&quot;</span>, <span className="font-bold text-emerald-600 bg-emerald-50 px-1 rounded">&quot;teacher&quot;</span>, hoặc <span className="font-bold text-orange-600 bg-orange-50 px-1 rounded">&quot;student&quot;</span> để test phân quyền. Bỏ trống mật khẩu cũng được.
              </p>
            </motion.div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
