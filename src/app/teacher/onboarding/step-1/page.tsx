'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { User, School, ArrowRight, MapPin } from 'lucide-react';
import { useState } from 'react';

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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
        
        <div className="mb-8">
          <p className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-2">BƯỚC 1 / 3</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thông tin hồ sơ giáo viên</h2>
          <p className="text-slate-600 text-sm">Nhập tên của thầy/cô, trường THPT và Tỉnh/Thành phố đang công tác để cá nhân hóa hệ thống.</p>
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
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Trường THPT</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <School className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={state.schoolName}
                  onChange={e => { updateState({ schoolName: e.target.value }); setError(''); }}
                  placeholder="Ví dụ: THPT Chuyên Lê Quý Đôn"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tỉnh / Thành Phố</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <input 
                  type="text" 
                  value={state.province || ''}
                  onChange={e => { updateState({ province: e.target.value }); setError(''); }}
                  placeholder="Ví dụ: Đà Nẵng"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                />
              </div>
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
    </div>
  );
}
