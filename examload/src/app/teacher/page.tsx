'use client';

import { useState } from 'react';
import { 
  Settings2, Database, Save, Printer, Upload, BookOpen, ChevronDown, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import QuizSetup from '@/components/teacher/QuizSetup';
import EssaySetup from '@/components/teacher/EssaySetup';
import QuestionBank from '@/components/teacher/QuestionBank';

type SidebarTab = 'setup' | 'question-bank' | 'saved-tests';
type TaskType = 'quiz' | 'essay' | 'chart';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('setup');
  const [taskType, setTaskType] = useState<TaskType>('quiz');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight">Hệ Thống Lập Kế Hoạch & Thiết Kế Đề Thi</h1>
            <p className="text-xs text-slate-500 font-medium">Chuyên môn hóa cho Giáo viên • Quản lý cấu trúc thời gian và câu hỏi thông minh</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 font-medium px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="flex flex-1 p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col gap-8">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">CÁC BƯỚC THỰC HIỆN</h3>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('setup')}
                className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left", 
                  activeTab === 'setup' ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}>
                <Settings2 className="w-5 h-5" />
                1. Thiết lập & Sinh đề
              </button>
              
              <button 
                onClick={() => setActiveTab('question-bank')}
                className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left", 
                  activeTab === 'question-bank' ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}>
                <Database className="w-5 h-5" />
                2. Ngân hàng câu hỏi
                <span className={clsx("ml-auto text-xs py-0.5 px-2 rounded-full font-bold", 
                  activeTab === 'question-bank' ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-600"
                )}>3</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('saved-tests')}
                className={clsx("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left", 
                  activeTab === 'saved-tests' ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}>
                <Save className="w-5 h-5" />
                3. Đề thi đã lưu
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">XUẤT ĐỀ KIỂM TRA</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 shadow-sm transition-colors">
                <Printer className="w-4 h-4" />
                In đề thi & Lời giải (PDF)
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-500/30 transition-colors">
                <Save className="w-4 h-4" />
                Lưu Đề Lên Hệ Thống
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">NHẬP ĐỀ THI CÓ SẴN</h3>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" />
              Chọn file JSON đề thi
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Task Type Selector */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-bold">Loại bài tập</h3>
                  <p className="text-xs text-slate-500 mt-1">Chọn định dạng thiết lập cho bài tập này</p>
                </div>
                <div className="relative">
                  <select 
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                  >
                    <option value="quiz">Trắc nghiệm (Quiz)</option>
                    <option value="essay">Tự luận (Essay)</option>
                    <option value="chart">Biểu đồ / Tự do</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Render Setup based on Task Type */}
              {taskType === 'quiz' && <QuizSetup />}
              {taskType === 'essay' && <EssaySetup />}
              {taskType === 'chart' && (
                <div className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-2xl">
                  <p className="text-slate-500">Giao diện thiết lập Biểu đồ đang được phát triển...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'question-bank' && <QuestionBank />}
          
          {activeTab === 'saved-tests' && (
            <div className="text-center py-20 bg-white border border-slate-200 shadow-sm rounded-2xl">
              <p className="text-slate-500">Danh sách đề thi đã lưu sẽ hiển thị ở đây...</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
