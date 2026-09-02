'use client';

import { useTranslate } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { ArrowLeft, ArrowRight, Calculator, Atom, FlaskConical, Dna, BookOpen, Languages, Scale, Globe, Hourglass, Check, Monitor, Cpu, Dumbbell, Shield, Music, Palette } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

const subjectsData = {
  natural: [
    { id: 'Toán', name: 'Toán học', desc: 'Đại số, Hình học, Giải tích và Xác suất thống kê THPT', icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'Vật lý', name: 'Vật lý', desc: 'Cơ học, Nhiệt học, Điện từ học, Quang học và Vật lý hạt nhân', icon: Atom, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { id: 'Hóa học', name: 'Hóa học', desc: 'Hóa học vô cơ, Hóa học hữu cơ và các phản ứng thực nghiệm', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'Sinh học', name: 'Sinh học', desc: 'Di truyền học, Tiến hóa, Sinh thái học và Cơ thể sinh vật', icon: Dna, color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'Tin học', name: 'Tin học', desc: 'Lập trình, Cơ sở dữ liệu và Ứng dụng công nghệ thông tin', icon: Monitor, color: 'text-teal-600', bg: 'bg-teal-100' },
    { id: 'Công nghệ', name: 'Công nghệ', desc: 'Công nghiệp, Nông nghiệp và Định hướng nghề nghiệp', icon: Cpu, color: 'text-slate-600', bg: 'bg-slate-100' },
  ],
  social: [
    { id: 'Ngữ Văn', name: 'Ngữ Văn', desc: 'Văn học Việt Nam, Văn học nước ngoài, Làm văn và Tiếng Việt', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'Tiếng Anh', name: 'Tiếng Anh', desc: 'Ngữ pháp, Từ vựng, Kỹ năng nghe nói đọc viết chuẩn đầu ra', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Pháp', name: 'Tiếng Pháp', desc: 'Ngôn ngữ và văn hóa Pháp', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Trung', name: 'Tiếng Trung', desc: 'Ngôn ngữ và văn hóa Trung Quốc', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Nhật', name: 'Tiếng Nhật', desc: 'Ngôn ngữ và văn hóa Nhật Bản', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Nga', name: 'Tiếng Nga', desc: 'Ngôn ngữ và văn hóa Nga', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Hàn', name: 'Tiếng Hàn', desc: 'Ngôn ngữ và văn hóa Hàn Quốc', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Tiếng Đức', name: 'Tiếng Đức', desc: 'Ngôn ngữ và văn hóa Đức', icon: Languages, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'Kinh tế & Pháp luật', name: 'Kinh tế & Pháp luật', desc: 'Kiến thức kinh tế cơ bản, pháp luật và quyền công dân Việt Nam', icon: Scale, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'Địa lý', name: 'Địa lý', desc: 'Địa lý tự nhiên, Địa lý dân cư và Địa lý kinh tế Việt Nam', icon: Globe, color: 'text-sky-600', bg: 'bg-sky-100' },
    { id: 'Lịch sử', name: 'Lịch sử', desc: 'Lịch sử Việt Nam qua các thời kỳ và Lịch sử thế giới cận hiện đại', icon: Hourglass, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 'GDTC', name: 'Giáo dục Thể chất', desc: 'Rèn luyện thể lực, kỹ năng vận động và thể thao', icon: Dumbbell, color: 'text-rose-600', bg: 'bg-rose-100' },
    { id: 'GDQP', name: 'GD Quốc phòng & An ninh', desc: 'Kiến thức quốc phòng, an ninh và kỹ năng quân sự', icon: Shield, color: 'text-zinc-600', bg: 'bg-zinc-100' },
    { id: 'Âm nhạc', name: 'Âm nhạc', desc: 'Lý thuyết âm nhạc, Thanh nhạc và Nhạc cụ', icon: Music, color: 'text-pink-600', bg: 'bg-pink-100' },
    { id: 'Mĩ thuật', name: 'Mĩ thuật', desc: 'Hội họa, Điêu khắc và Lịch sử mĩ thuật', icon: Palette, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  ]
};

export default function Step2Page() {
  const tr = useTranslate();
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
      setError(tr("Vui lòng chọn ít nhất một bộ môn"));
      return;
    }
    router.push('/teacher/onboarding/step-3');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
      
      <div className="mb-8">
        <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">{tr("BƯỚC 2 / 3")}</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{tr("Chọn Tổ hợp và Bộ môn phụ trách")}</h2>
        <p className="text-slate-600 text-sm">{tr("Cấp THPT Việt Nam phân chia 2 ban chính. Vui lòng chọn Ban rồi chọn Môn học tương ứng.")}</p>
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
              <span className={clsx("font-semibold", state.subjectGroup === 'natural' ? "text-blue-600" : "text-slate-700")}>{tr("Ban Tự nhiên")}</span>
            </div>
            {state.subjectGroup === 'natural' && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
          <span className="text-slate-600 text-xs text-left">{tr("Toán, Lý, Hóa, Sinh, Tin, Công nghệ")}</span>
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
              <span className={clsx("font-semibold", state.subjectGroup === 'social' ? "text-purple-600" : "text-slate-700")}>{tr("Ban Xã hội")}</span>
            </div>
            {state.subjectGroup === 'social' && <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
          <span className="text-slate-600 text-xs text-left">{tr("Văn, Sử, Địa, Ngoại ngữ, KT&PL, GDTC, QPAN, Nghệ thuật")}</span>
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          {tr("CHỌN BỘ MÔN GIẢNG DẠY TRONG")} {state.subjectGroup === 'natural' ? tr("BAN TỰ NHIÊN") : tr("BAN XÃ HỘI")}
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
                  <div className="font-semibold text-slate-900 mb-1">{tr(subject.name)}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{tr(subject.desc)}</div>
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
          {tr("Quay lại")}
        </button>
        <button 
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
        >
          {tr("Tiếp theo")}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
