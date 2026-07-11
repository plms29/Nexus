'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { User, School, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const mockProfiles = [
  { name: 'Nguyễn Minh Trí', subject: 'Toán', school: 'Chuyên Hà Nội - Amsterdam', classes: '10A1, 11A1, 12A1', subjectGroup: 'natural' },
  { name: 'Trần Thị Mai', subject: 'Ngữ Văn', school: 'Lê Hồng Phong (TP.HCM)', classes: '10D1, 11D1, 12D1', subjectGroup: 'social' },
  { name: 'Phạm Vũ Hoàng', subject: 'Lý', school: 'Quốc Học Huế', classes: '11A1, 11A2, 12A2', subjectGroup: 'natural' },
  { name: 'Lê Thu Hương', subject: 'Tiếng Anh', school: 'Nguyễn Thị Minh Khai', classes: '10A2, 11B1, 12D1', subjectGroup: 'social' },
];

export default function Step1Page() {
  const router = useRouter();
  const { state, updateState } = useOnboarding();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!state.teacherName.trim() || !state.schoolName.trim()) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    router.push('/teacher/onboarding/step-2');
  };

  const handleQuickLogin = (profile: typeof mockProfiles[0]) => {
    // For prototype, bypass onboarding directly to dashboard with mock context or just route
    // Here we can populate context and route to dashboard to simulate login
    updateState({
      teacherName: profile.name,
      schoolName: profile.school,
      subjectGroup: profile.subjectGroup as "natural" | "social",
      selectedSubjects: [profile.subject],
      selectedClasses: profile.classes.split(', '),
    });
    router.push('/teacher');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
        
        <div className="mb-8">
          <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">BƯỚC 1 / 3</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thông tin hồ sơ giáo viên</h2>
          <p className="text-slate-600 text-sm">Nhập tên của thầy/cô và chọn trường THPT đang công tác để cá nhân hóa hệ thống.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Họ và Tên Giáo Viên</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={state.teacherName}
                onChange={e => { updateState({ teacherName: e.target.value }); setError(''); }}
                placeholder="Ví dụ: Hoàng Minh Hiếu"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Trường Trung Học Phổ Thông (THPT)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <School className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={state.schoolName}
                onChange={e => { updateState({ schoolName: e.target.value }); setError(''); }}
                placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
            >
              Tiếp theo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-slate-500 text-xs font-semibold tracking-widest uppercase">Đăng Nhập Nhanh (Tài khoản mẫu)</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          {mockProfiles.map((profile, i) => (
            <button 
              key={i} 
              onClick={() => handleQuickLogin(profile)}
              className="bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md rounded-xl p-4 text-left transition-all hover:-translate-y-1"
            >
              <div className="font-semibold text-slate-900 text-sm mb-2">{profile.name}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${profile.subjectGroup === 'natural' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {profile.subject}
                </span>
                <span className="text-slate-600 text-xs truncate flex-1">{profile.school}</span>
              </div>
              <div className="text-slate-500 text-[10px]">Lớp: {profile.classes}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
