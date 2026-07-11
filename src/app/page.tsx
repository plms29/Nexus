'use client';

import Link from 'next/link';
import { 
  ArrowRight, BookOpen, BrainCircuit, Target, ShieldCheck, 
  User, CheckCircle2, Clock, TrendingUp, Sparkles, 
  GraduationCap, LayoutDashboard, Calendar, Zap, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">ExamLoad Radar</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Bắt đầu
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 relative overflow-visible">
        {/* Decorative Background Patterns */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/20 blur-[120px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-400/20 blur-[100px] rounded-full pointer-events-none" 
        />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-8 hover:bg-blue-100 cursor-default transition-colors shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Nền tảng Giáo dục Thông minh 2.0
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.15]">
              Quản lý khối lượng học tập <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                hiệu quả & khoa học.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              ExamLoad Radar kết nối Giáo viên và Học sinh thông qua hệ thống Workmap tự động. Tối ưu hóa thời gian, cân bằng môn học và nâng cao hiệu suất ôn thi.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link 
                href="/login"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40"
              >
                Trải nghiệm ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-sm transition-all hover:-translate-y-1"
              >
                Tìm hiểu thêm
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Abstract UI */}
          <div className="relative hidden lg:block h-[500px]">
            {/* Main Window */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-6 transition-transform duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-100 rounded mt-2"></div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Pro</div>
              </div>
              
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-3/4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-orange-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-2/3 bg-slate-200 rounded mb-2"></div>
                    <div className="h-2 w-1/3 bg-slate-100 rounded"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-purple-200 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Mini Card 1 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 w-[220px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shadow-inner shrink-0">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-800">+34%</div>
                  <div className="text-xs font-semibold text-slate-500">Hiệu suất học tập</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Mini Card 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-10 left-0 w-[200px] bg-white rounded-2xl shadow-xl border border-slate-100 p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shadow-inner shrink-0">
                  <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">12 LU</div>
                  <div className="text-xs font-semibold text-slate-500">Chỉ số Workmap</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Stats Section with Infinite Marquee styling (Visual only) */}
      <section className="bg-slate-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10"
        >
          <motion.div variants={fadeInUp} className="p-4 hover:-translate-y-2 transition-transform">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">50K+</div>
            <div className="text-blue-300 font-medium">Học sinh sử dụng</div>
          </motion.div>
          <motion.div variants={fadeInUp} className="p-4 hover:-translate-y-2 transition-transform">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">2K+</div>
            <div className="text-blue-300 font-medium">Giáo viên tin dùng</div>
          </motion.div>
          <motion.div variants={fadeInUp} className="p-4 hover:-translate-y-2 transition-transform">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">1M+</div>
            <div className="text-blue-300 font-medium">Đề thi đã tạo</div>
          </motion.div>
          <motion.div variants={fadeInUp} className="p-4 hover:-translate-y-2 transition-transform">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">99%</div>
            <div className="text-blue-300 font-medium">Cải thiện điểm số</div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Tính năng đột phá</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Hệ sinh thái giáo dục toàn diện, phân quyền thông minh dành riêng cho trường THPT.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={fadeInUp}>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group cursor-pointer h-full"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Workmap Thông Minh</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Tự động lập lịch biểu học tập cá nhân hóa cho học sinh, trực quan hóa cường độ học tập bằng hệ số Load Units (LU).
                </p>
              </motion.div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div variants={fadeInUp}>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group cursor-pointer h-full"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Quản lý Đề Thi Đa Năng</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Cung cấp công cụ thiết lập Quiz và Essay chuẩn xác, xuất file PDF cho Giáo viên ngay trên hệ thống. Tính toán thời gian tự động.
                </p>
              </motion.div>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div variants={fadeInUp}>
              <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all group cursor-pointer h-full"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Phân Quyền Chi Tiết</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Tích hợp luồng Onboarding nhận diện Ban tự nhiên và Ban xã hội, tùy chỉnh giao diện riêng cho mỗi giáo viên và học sinh.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-6 relative z-10"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[50%] -right-[20%] w-[500px] h-[500px] border-[40px] border-white/5 rounded-full pointer-events-none"
            />
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 relative z-10">Sẵn sàng để bứt phá điểm số?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium relative z-10">
              Tham gia cùng hàng ngàn giáo viên và học sinh đang sử dụng ExamLoad Radar mỗi ngày để tối ưu hóa quá trình dạy và học.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block relative z-10">
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg hover:shadow-xl"
              >
                <Users className="w-5 h-5" />
                Tạo tài khoản miễn phí
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">ExamLoad Radar</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Hệ thống Quản lý Khối lượng Học tập thông minh, giúp học sinh cân bằng cuộc sống và đạt kết quả cao trong các kỳ thi.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Sản phẩm</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Tính năng</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Bảng giá</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Hướng dẫn</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Công ty</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Về chúng tôi</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Liên hệ</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Bảo mật</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <p className="text-slate-500 text-sm">
            &copy; 2026 ExamLoad Radar. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Facebook</Link>
            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
