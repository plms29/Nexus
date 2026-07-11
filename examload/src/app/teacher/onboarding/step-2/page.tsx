'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, ArrowRight, Calculator, Atom, FlaskConical, Dna, BookOpen, Languages, Scale, Globe, Hourglass, Check } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const subjectsData = {
  natural: [
    { id: 'Toán', name: 'Toán học', desc: 'Đại số, Hình học, Giải tích và Xác suất thống kê THPT', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'Vật lý', name: 'Vật lý', desc: 'Cơ học, Nhiệt học, Điện từ học, Quang học và Vật lý hạt nhân', icon: Atom, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { id: 'Hóa học', name: 'Hóa học', desc: 'Hóa học vô cơ, Hóa học hữu cơ và các phản ứng thực nghiệm', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'Sinh học', name: 'Sinh học', desc: 'Di truyền học, Tiến hóa, Sinh thái học và Cơ thể sinh vật', icon: Dna, color: 'text-green-600', bg: 'bg-green-100' },
  ],
  social: [
    { id: 'Ngữ Văn', name: 'Ngữ Văn', desc: 'Văn học Việt Nam, Văn học nước ngoài, Làm văn và Tiếng Việt', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'Tiếng Anh', name: 'Tiếng Anh', desc: 'Ngữ pháp, Từ vựng, Kỹ năng nghe nói đọc viết chuẩn đầu ra', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Kinh tế & Pháp luật', name: 'Kinh tế & Pháp luật', desc: 'Kiến thức kinh tế cơ bản, pháp luật và quyền công dân Việt Nam', icon: Scale, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'Địa lý', name: 'Địa lý', desc: 'Địa lý tự nhiên, Địa lý dân cư và Địa lý kinh tế Việt Nam', icon: Globe, color: 'text-sky-600', bg: 'bg-sky-100' },
    { id: 'Lịch sử', name: 'Lịch sử', desc: 'Lịch sử Việt Nam qua các thời kỳ và Lịch sử thế giới cận hiện đại', icon: Hourglass, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]
};

export default function Step2Page() {
  const router = useRouter();
  const { state, updateState } = useOnboarding();
  const [error, setError] = useState('');

  const toggleSubject = (subjectId: string) => {
    const current = state.selectedSubjects;
    if (current.includes(subjectId)) {
      updateState({ selectedSubjects: [] });
    } else {
      updateState({ selectedSubjects: [subjectId] });
    }
    setError('');
  };

  const handleNext = () => {
    if (state.selectedSubjects.length === 0) {
      setError('Vui lòng chọn ít nhất một bộ môn');
      return;
    }
    router.push('/teacher/onboarding/step-3');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
      
      <div className="mb-8">
        <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">BƯỚC 2 / 3</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chọn Tổ hợp và Bộ môn phụ trách</h2>
        <p className="text-slate-600 text-sm">Cấp THPT Việt Nam phân chia 2 ban chính. Vui lòng chọn Ban rồi chọn Môn học tương ứng.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => { updateState({ subjectGroup: 'natural', selectedSubjects: [] }); setError(''); }}
          className={clsx(
            "p-4 rounded-xl border flex flex-col items-start transition-all",
            state.subjectGroup === 'natural' 
              ? "bg-blue-50 border-blue-500" 
              : "bg-slate-50 border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2">
              <span className={clsx(
                "text-xs font-bold px-2 py-1 rounded",
                state.subjectGroup === 'natural' ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
              )}>T/N</span>
              <span className={clsx("font-semibold", state.subjectGroup === 'natural' ? "text-blue-600" : "text-slate-700")}>Ban Tự nhiên</span>
            </div>
            {state.subjectGroup === 'natural' && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
          <span className="text-slate-600 text-xs text-left">Toán học, Vật lý, Hóa học, Sinh học</span>
        </button>

        <button
          onClick={() => { updateState({ subjectGroup: 'social', selectedSubjects: [] }); setError(''); }}
          className={clsx(
            "p-4 rounded-xl border flex flex-col items-start transition-all",
            state.subjectGroup === 'social' 
              ? "bg-purple-50 border-purple-500" 
              : "bg-slate-50 border-slate-200 hover:border-slate-300"
          )}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center gap-2">
              <span className={clsx(
                "text-xs font-bold px-2 py-1 rounded",
                state.subjectGroup === 'social' ? "bg-purple-500 text-white" : "bg-slate-200 text-slate-600"
              )}>X/H</span>
              <span className={clsx("font-semibold", state.subjectGroup === 'social' ? "text-purple-600" : "text-slate-700")}>Ban Xã hội</span>
            </div>
            {state.subjectGroup === 'social' && <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
          <span className="text-slate-600 text-xs text-left">Ngữ Văn, Tiếng Anh, Kinh tế & PL, Địa lý, Lịch sử</span>
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          CHỌN BỘ MÔN GIẢNG DẠY TRONG {state.subjectGroup === 'natural' ? 'BAN TỰ NHIÊN' : 'BAN XÃ HỘI'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {subjectsData[state.subjectGroup].map((subject) => {
            const isSelected = state.selectedSubjects.includes(subject.id);
            const Icon = subject.icon;
            return (
              <button
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={clsx(
                  "p-4 rounded-xl border flex gap-4 text-left transition-all",
                  isSelected 
                    ? "bg-blue-50/50 border-blue-500 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", subject.bg, subject.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">{subject.name}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{subject.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button 
          onClick={() => router.push('/teacher/onboarding/step-1')}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <button 
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
        >
          Tiếp theo
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
