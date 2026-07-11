'use client';

import { LogOut, Calendar, User, Search, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

type SubjectColor = 'red' | 'green' | 'blue' | 'teal' | 'pink' | 'yellow' | 'purple' | 'orange';

interface TaskBlock {
  id: string;
  subject: string;
  title: string;
  lu: number;
  color: SubjectColor;
  isQuiz?: boolean;
}

interface DayColumn {
  dayName: string;
  dateStr: string;
  isToday?: boolean;
  tasks: TaskBlock[];
}

const colorStyles: Record<SubjectColor, string> = {
  red: 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20',
  green: 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20',
  blue: 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20',
  teal: 'bg-teal-500 hover:bg-teal-600 shadow-md shadow-teal-500/20',
  pink: 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/20',
  yellow: 'bg-yellow-400 hover:bg-yellow-500 shadow-md shadow-yellow-500/20 text-yellow-950',
  purple: 'bg-purple-500 hover:bg-purple-600 shadow-md shadow-purple-500/20',
  orange: 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20',
};

const textStyles: Record<SubjectColor, string> = {
  red: 'text-white',
  green: 'text-white',
  blue: 'text-white',
  teal: 'text-white',
  pink: 'text-white',
  yellow: 'text-yellow-950', // Yellow needs darker text for contrast
  purple: 'text-white',
  orange: 'text-white',
};

const badgeStyles: Record<SubjectColor, string> = {
  red: 'bg-rose-900/20 text-white',
  green: 'bg-emerald-900/20 text-white',
  blue: 'bg-blue-900/20 text-white',
  teal: 'bg-teal-900/20 text-white',
  pink: 'bg-pink-900/20 text-white',
  yellow: 'bg-yellow-900/10 text-yellow-950 border border-yellow-950/20',
  purple: 'bg-purple-900/20 text-white',
  orange: 'bg-orange-900/20 text-white',
};

const mockData: DayColumn[] = [
  {
    dayName: 'THỨ HAI',
    dateStr: '07',
    isToday: true,
    tasks: [
      { id: '1', subject: 'TOÁN', title: 'Toán Giải Tích', lu: 3, color: 'red' },
      { id: '2', subject: 'LÝ', title: 'Vật Lý Đại Cương', lu: 2, color: 'yellow' },
    ]
  },
  {
    dayName: 'THỨ BA',
    dateStr: '08',
    tasks: [
      { id: '3', subject: 'HÓA', title: 'Hóa Hữu Cơ', lu: 4, color: 'green' },
    ]
  },
  {
    dayName: 'THỨ TƯ',
    dateStr: '09',
    tasks: [
      { id: '4', subject: 'VĂN', title: 'Ngữ Văn', lu: 2, color: 'blue' },
      { id: '5', subject: 'ANH', title: 'Tiếng Anh B2', lu: 3, color: 'purple', isQuiz: true },
      { id: '6', subject: 'SỬ', title: 'Lịch Sử VN', lu: 1, color: 'orange' },
    ]
  },
  {
    dayName: 'THỨ NĂM',
    dateStr: '10',
    tasks: [
      { id: '7', subject: 'ĐỊA', title: 'Địa Lý KT', lu: 2, color: 'teal' },
    ]
  },
  {
    dayName: 'THỨ SÁU',
    dateStr: '11',
    tasks: [
      { id: '8', subject: 'SINH', title: 'Sinh Học Phân Tử', lu: 5, color: 'pink' },
      { id: '9', subject: 'TOÁN', title: 'Toán Giải Tích', lu: 2, color: 'red' },
    ]
  },
  {
    dayName: 'THỨ BẢY',
    dateStr: '12',
    tasks: [
      { id: '10', subject: 'LÝ', title: 'Vật Lý Đại Cương', lu: 3, color: 'yellow', isQuiz: true },
      { id: '11', subject: 'HÓA', title: 'Hóa Hữu Cơ', lu: 1, color: 'green' },
    ]
  },
  {
    dayName: 'CHỦ NHẬT',
    dateStr: '13',
    tasks: []
  },
];


export default function StudentWorkmap() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight">Workmap Cá Nhân</h1>
            <p className="text-xs text-slate-500 font-medium">Tháng 7 • 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài tập..." 
              className="bg-slate-100 border border-slate-200 text-sm rounded-full pl-9 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 w-64 text-slate-900 placeholder:text-slate-400 transition-colors"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full overflow-x-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Workmap</h2>
          <p className="text-slate-500 mt-2 text-sm flex items-center gap-2 font-medium">
            <Calendar className="w-4 h-4" />
            Bấm vào thẻ để xem chi tiết bài tập
          </p>
        </div>

        <div className="flex gap-4 min-w-max pb-8">
          {mockData.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-4 w-[160px] shrink-0">
              {/* Day Header */}
              <div className={clsx(
                "rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all border",
                col.isToday 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105 origin-bottom" 
                  : "bg-white text-slate-700 border-slate-200 shadow-sm"
              )}>
                <div className={clsx("text-[10px] font-bold uppercase tracking-widest", col.isToday ? "text-indigo-200" : "text-slate-500")}>
                  {col.dayName}
                </div>
                <div className="text-3xl font-extrabold mt-1 mb-1">
                  {col.dateStr}
                </div>
                {col.isToday && (
                  <div className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm mt-1">
                    Hôm nay
                  </div>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-3 mt-2">
                {col.tasks.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl h-24 flex items-center justify-center bg-slate-50/50">
                    <span className="text-slate-400 text-xs font-medium">Trống</span>
                  </div>
                ) : (
                  col.tasks.map(task => (
                    <div 
                      key={task.id} 
                      className={clsx(
                        "rounded-2xl p-4 cursor-pointer transition-all hover:scale-105 active:scale-95 group",
                        colorStyles[task.color]
                      )}
                    >
                      <div className={clsx("text-xs font-bold mb-1 opacity-80", textStyles[task.color])}>
                        {task.subject}
                      </div>
                      <div className={clsx("font-bold text-[15px] leading-tight mb-3 line-clamp-2", textStyles[task.color])}>
                        {task.title}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className={clsx("text-xs px-2 py-1 rounded-lg font-bold flex items-center gap-1", badgeStyles[task.color])}>
                          {task.lu} LU
                        </div>
                        
                        {task.isQuiz && (
                          <div className={clsx("text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm", textStyles[task.color])}>
                            Quiz
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
