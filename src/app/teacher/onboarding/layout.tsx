'use client';

import { useTranslate } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { usePathname, useRouter } from 'next/navigation';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { Check, GraduationCap, LogOut } from 'lucide-react';
import clsx from 'clsx';

function Stepper() {
  const tr = useTranslate();
  const pathname = usePathname();
  
  const steps = [
    { id: 1, name: 'Hồ sơ', path: '/teacher/onboarding/step-1' },
    { id: 2, name: 'Chuyên môn', path: '/teacher/onboarding/step-2' },
    { id: 3, name: 'Lớp dạy', path: '/teacher/onboarding/step-3' },
  ];

  const currentStepIndex = steps.findIndex(s => s.path === pathname);

  return (
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto mb-8 mt-12">
      {steps.map((step, index) => {
        const isCompleted = currentStepIndex > index;
        const isActive = currentStepIndex === index;
        
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={clsx(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                  isActive ? "bg-blue-600 border-blue-600 text-white" : 
                  "bg-white border-slate-300 text-slate-400"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
              </div>
              <span className={clsx(
                "mt-2 text-sm font-medium",
                (isActive || isCompleted) ? "text-blue-500" : "text-slate-500"
              )}>
                {tr(step.name)}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-32 h-[2px] mx-4 mb-6">
                <div 
                  className={clsx(
                    "h-full w-full transition-all duration-300",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  )} 
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const tr = useTranslate();
  const router = useRouter();
  
  return (
    <OnboardingProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Left Sidebar */}
        <div className="hidden lg:flex flex-col w-[400px] border-r border-slate-200 bg-white p-8 relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{tr("Hệ thống trực tuyến")}</div>
              <div className="text-sm font-bold text-slate-900 tracking-wide">EDU-PORTAL THPT</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 leading-tight mb-6">
            {tr("Phân quyền thông minh,")}<br />
            {tr("Tối ưu giảng dạy.")}
          </h1>
          
          <p className="text-slate-600 leading-relaxed text-sm">
            {tr("Hệ thống phân quyền thông minh dành riêng cho giáo viên bộ môn Trung học Phổ thông tại Việt Nam. Tự động cá nhân hóa công cụ giảng dạy, sổ điểm và tài nguyên chuyên môn dựa trên Ban học")} <span className="text-blue-600 font-semibold">{tr("Tự nhiên")}</span> & <span className="text-purple-600 font-semibold">{tr("Xã hội")}</span>.
          </p>

          <div className="mt-auto absolute bottom-8 left-8 right-8">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
              <p className="text-slate-600 text-xs italic leading-relaxed">
                {tr("\"Dưới ánh mặt trời không có nghề nào cao quý hơn nghề dạy học.\"")}
              </p>
              <p className="text-slate-500 text-[10px] text-right mt-2">— Comenius</p>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col items-center bg-slate-50 relative">
          <div className="absolute top-6 left-6"><LanguageToggle /></div>
          <button
            onClick={() => router.push('/login')}
            className="absolute top-6 right-6 flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {tr("Đăng xuất")}
          </button>
          <Stepper />
          <div className="w-full max-w-3xl px-8 pb-12 flex-1">
            {children}
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );
}
