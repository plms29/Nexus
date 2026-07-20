'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, Sparkles, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const classOptions = {
  10: ['10A1', '10A2', '10D1', '10D2'],
  11: ['11A1', '11A2', '11B1', '11D1'],
  12: ['12A1', '12A2', '12A3', '12D1'],
};

export default function Step3Page() {
  const router = useRouter();
  const { state, updateState } = useOnboarding();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleClass = (className: string) => {
    const current = state.selectedClasses;
    if (current.includes(className)) {
      updateState({ selectedClasses: current.filter(c => c !== className) });
    } else {
      updateState({ selectedClasses: [...current, className] });
    }
    setError('');
  };

  const handleFinish = async () => {
    if (state.selectedClasses.length === 0) {
      setError('Vui lòng chọn ít nhất một lớp học');
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      const isMockMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url';
      
      if (!isMockMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { error: dbError } = await supabase.from('teacher_profiles').upsert({
            id: session.user.id,
            name: state.teacherName,
            school: state.schoolName,
            subject_group: state.subjectGroup,
            subjects: state.selectedSubjects,
            classes: state.selectedClasses,
          });
          if (dbError && dbError.code !== 'PGRST205') throw dbError;
          if (dbError?.code === 'PGRST205') {
            console.warn('teacher_profiles table does not exist. Falling back to local storage only.');
          }
        }
      }

      // Set local storage flag for mock bypass
      localStorage.setItem('examload_onboarding_done', 'true');
      
      console.log('Onboarding complete:', state);
      router.push('/teacher');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
      
      <div className="mb-8">
        <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">BƯỚC 3 / 3</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký lớp học phụ trách</h2>
        <p className="text-slate-600 text-sm">Chọn một hoặc nhiều lớp thầy/cô đang giảng dạy các bộ môn đã chọn trong học kỳ này.</p>
      </div>

      <div className="space-y-6 mb-8">
        {(Object.keys(classOptions) as unknown as Array<keyof typeof classOptions>).map((grade) => (
          <div key={grade} className="border-b border-slate-200 pb-6 last:border-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">KHỐI {grade}</h3>
            <div className="flex flex-wrap gap-3">
              {classOptions[grade].map((className) => {
                const isSelected = state.selectedClasses.includes(className);
                return (
                  <button
                    key={className}
                    onClick={() => toggleClass(className)}
                    className={clsx(
                      "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                      isSelected 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {className}
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button 
          onClick={() => router.push('/teacher/onboarding/step-2')}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button 
          onClick={handleFinish}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : 'Xác nhận đăng nhập'}
        </button>
      </div>
    </div>
  );
}
