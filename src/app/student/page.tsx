'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LogOut, 
  Calendar, 
  User, 
  Search, 
  Bell, 
  X, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Layers,
  CheckSquare,
  Square,
  Award,
  HelpCircle,
  Play,
  GraduationCap,
  Filter,
  Eye
} from 'lucide-react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Task } from '@/lib/engine/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { StudentOnboardingModal } from '@/components/student/StudentOnboardingModal';
import { StudentQuizPlayerModal } from '@/components/student/StudentQuizPlayerModal';
import { StudentWorkmapDetailModal } from '@/components/student/StudentWorkmapDetailModal';
import { normalizeClassId, resolveStudentClassId } from '@/lib/class-utils';

type SubjectColor = 'red' | 'green' | 'blue' | 'teal' | 'pink' | 'yellow' | 'purple' | 'orange';

interface TaskBlock {
  id: string;
  subject: string;
  title: string;
  lu: number;
  color: SubjectColor;
  isQuiz?: boolean;
  isEssay?: boolean;
  taskRef?: Task;
  stepName?: string;
}

interface DayColumn {
  dayName: string;
  dateStr: string;
  isToday?: boolean;
  tasks: TaskBlock[];
}

const colorStyles: Record<SubjectColor, string> = {
  red: 'bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 text-white',
  green: 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 text-white',
  blue: 'bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 text-white',
  teal: 'bg-teal-500 hover:bg-teal-600 shadow-md shadow-teal-500/20 text-white',
  pink: 'bg-pink-500 hover:bg-pink-600 shadow-md shadow-pink-500/20 text-white',
  yellow: 'bg-amber-400 hover:bg-amber-500 shadow-md shadow-amber-500/20 text-amber-950',
  purple: 'bg-purple-500 hover:bg-purple-600 shadow-md shadow-purple-500/20 text-white',
  orange: 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 text-white',
};

const badgeStyles: Record<SubjectColor, string> = {
  red: 'bg-rose-900/20 text-white',
  green: 'bg-emerald-900/20 text-white',
  blue: 'bg-blue-900/20 text-white',
  teal: 'bg-teal-900/20 text-white',
  pink: 'bg-pink-900/20 text-white',
  yellow: 'bg-amber-900/10 text-amber-950 border border-amber-950/20',
  purple: 'bg-purple-900/20 text-white',
  orange: 'bg-orange-900/20 text-white',
};

export default function StudentWorkmap() {
  const router = useRouter();
  const { tasks, workmap, loadStudentData, studentProfile, setStudentProfile, quizResults } = useStore();

  const [activeTab, setActiveTab] = useState<'workmap' | 'assignments'>('workmap');
  const [pastDaysView, setPastDaysView] = useState<'compact' | 'full'>('compact');
  const [showDetailWorkmapModal, setShowDetailWorkmapModal] = useState<boolean>(false);

  const [selectedEssayTask, setSelectedEssayTask] = useState<TaskBlock | null>(null);
  const [selectedQuizTask, setSelectedQuizTask] = useState<Task | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const autoOpenedOnboarding = useRef(false);
  const [checkedOutlineIds, setCheckedOutlineIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Assignments tab filters
  const [assignmentsSearch, setAssignmentsSearch] = useState<string>('');
  const [assignmentsFilterType, setAssignmentsFilterType] = useState<string>('all');
  const [assignmentsFilterStatus, setAssignmentsFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadStudentData();
  }, [loadStudentData]);

  useEffect(() => {
    if (!studentProfile.isOnboarded && !autoOpenedOnboarding.current) {
      autoOpenedOnboarding.current = true;
      setShowOnboarding(true);
    }
  }, [studentProfile.isOnboarded]);

  // Build day columns on Student Workmap timeline dynamically from database
  const dayColumns: DayColumn[] = useMemo(() => {
    const currentStudentClass = resolveStudentClassId(studentProfile.classId);
    if (!currentStudentClass) return [];

    const today = new Date();
    const dayNamesMap = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    const datesToDisplay: Date[] = [];

    if (pastDaysView === 'compact') {
      // Show ONLY 1 day in the past (Yesterday) + Today + remaining days of current week (at least 5 days)
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const currentDayIdx = today.getDay(); // 0 is Sun, 1 is Mon...
      const daysUntilSunday = currentDayIdx === 0 ? 0 : 7 - currentDayIdx;
      const totalCount = Math.max(5, 2 + daysUntilSunday); // 1 past day + today + remaining

      for (let i = 0; i < totalCount; i++) {
        const d = new Date(yesterday);
        d.setDate(yesterday.getDate() + i);
        datesToDisplay.push(d);
      }
    } else {
      // Full week view: Monday to Sunday of current week
      const currentDay = today.getDay(); // 0: Sun, 1: Mon...
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        datesToDisplay.push(d);
      }
    }

    const cols: DayColumn[] = [];

    datesToDisplay.forEach((d) => {
      const dateStrYmd = format(d, 'yyyy-MM-dd');
      const dateDisplay = format(d, 'dd/MM');
      const isToday = dateStrYmd === format(today, 'yyyy-MM-dd');
      const dayName = dayNamesMap[d.getDay()];

      // Find workmap entries for this day from DB matching student class
      const dayEntries = workmap.filter(w => {
        if (w.date !== dateStrYmd) return false;
        const task = tasks.find(t => t.id === w.task_id);
        if (!task) return false;
        return normalizeClassId(task.class_id) === currentStudentClass;
      });
      const taskBlocks: TaskBlock[] = [];

      dayEntries.forEach((entry, idx) => {
        const task = tasks.find(t => t.id === entry.task_id);
        if (task) {
          const rawLu = Number(entry.lu) || (task.type === 'quiz' ? 1.5 : 2.5);
          const roundedLu = Math.round(rawLu * 10) / 10;
          taskBlocks.push({
            id: `${entry.task_id}-${entry.step_name || idx}`,
            subject: (task.subject_id || 'MÔN HỌC').toUpperCase(),
            title: entry.step_name ? `${task.title} (${entry.step_name})` : task.title,
            lu: roundedLu,
            color: task.subject_id === 'Ngữ văn' ? 'blue' : task.subject_id === 'Tiếng Anh' ? 'purple' : task.type === 'quiz' ? 'yellow' : 'teal',
            isEssay: task.type !== 'quiz',
            isQuiz: task.type === 'quiz',
            taskRef: task,
            stepName: entry.step_name
          });
        }
      });

      // Also check tasks for student class whose deadline matches this day and don't have workmap entries yet
      tasks.forEach(t => {
        if (normalizeClassId(t.class_id) !== currentStudentClass) return;
        if (t.deadline === dateStrYmd) {
          const hasWorkmapEntries = workmap.some(w => w.task_id === t.id);
          if (!hasWorkmapEntries) {
            const alreadyAdded = taskBlocks.some(tb => tb.taskRef?.id === t.id);
            if (!alreadyAdded) {
              taskBlocks.push({
                id: t.id,
                subject: (t.subject_id || 'MÔN HỌC').toUpperCase(),
                title: t.title,
                lu: t.type === 'quiz' ? 1.5 : 2.5,
                color: t.subject_id === 'Ngữ văn' ? 'blue' : t.subject_id === 'Tiếng Anh' ? 'purple' : t.type === 'quiz' ? 'yellow' : 'teal',
                isEssay: t.type !== 'quiz',
                isQuiz: t.type === 'quiz',
                taskRef: t
              });
            }
          }
        }
      });

      cols.push({
        dayName,
        dateStr: dateDisplay,
        isToday,
        tasks: taskBlocks
      });
    });

    // Filter by search query if present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return cols.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => t.title.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q))
      }));
    }

    return cols;
  }, [tasks, workmap, searchQuery, pastDaysView, studentProfile.classId]);

  const toggleOutlineCheck = (id: string) => {
    setCheckedOutlineIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const realEssayTask = selectedEssayTask?.taskRef;
  const isOutlineApproved = realEssayTask?.is_outline_approved ?? true;
  const outlineItems = realEssayTask?.outline && Array.isArray(realEssayTask.outline) && realEssayTask.outline.length > 0 
    ? realEssayTask.outline 
    : [];

  const processSteps = realEssayTask?.essay_steps && Array.isArray(realEssayTask.essay_steps) && realEssayTask.essay_steps.length > 0
    ? realEssayTask.essay_steps
    : [];

  const filteredAssignments = useMemo(() => {
    return tasks.filter(task => {
      const studentClass = resolveStudentClassId(studentProfile.classId);
      if (!studentClass) return false;
      if (normalizeClassId(task.class_id) !== studentClass) return false;

      if (assignmentsFilterType !== 'all' && task.type !== assignmentsFilterType) return false;

      const isDone = !!quizResults[task.id];
      if (assignmentsFilterStatus === 'completed' && !isDone) return false;
      if (assignmentsFilterStatus === 'pending' && isDone) return false;

      if (assignmentsSearch.trim()) {
        const q = assignmentsSearch.toLowerCase();
        return task.title.toLowerCase().includes(q) || (task.subject_id && task.subject_id.toLowerCase().includes(q));
      }

      return true;
    });
  }, [tasks, studentProfile, assignmentsFilterType, assignmentsFilterStatus, assignmentsSearch, quizResults]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="w-11 h-11 bg-white rounded-2xl p-0.5 flex items-center justify-center shadow-md shadow-slate-200 hover:scale-105 transition-all cursor-pointer border border-slate-200 overflow-hidden shrink-0"
          >
            {studentProfile.avatar && studentProfile.avatar.startsWith('http') ? (
              <img src={studentProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-xl">{studentProfile.avatar || '👨‍🎓'}</span>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                {studentProfile.name || 'Nguyễn Văn Học'}
              </h1>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                title="Bấm để chỉnh sửa hồ sơ & đổi lớp học"
                className="text-[10px] font-black uppercase tracking-wider bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full cursor-pointer transition-all flex items-center gap-1 group"
              >
                <span>{studentProfile.classId ? `Lớp ${studentProfile.classId}` : 'Chưa chọn lớp'}</span>
                <span className="text-[10px] text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity">✏️</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              {studentProfile.school || 'THPT Chuyên Lê Quý Đôn'} {studentProfile.province ? `(${studentProfile.province})` : '(Đà Nẵng)'} • Học kỳ I
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài tập..." 
              className="bg-slate-100 border border-slate-200 text-xs rounded-full pl-9 pr-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 transition-colors font-semibold"
            />
          </div>

          <button 
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-bold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            Hồ sơ học sinh
          </button>

          <button 
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 max-w-[1600px] mx-auto w-full overflow-x-auto">
        {/* Navigation Tab Bar (Tab 1: Lịch Workmap, Tab 2: Làm Bài & Bài Tập) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 mb-6 pb-2 gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('workmap')}
              className={clsx(
                "px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer border",
                activeTab === 'workmap'
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span>Lịch Workmap Cá Nhân</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={clsx(
                "px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer border relative",
                activeTab === 'assignments'
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>Làm Bài & Bài Tập</span>
              {tasks.length > 0 && (
                <span className={clsx(
                  "px-2 py-0.5 rounded-full text-[10px] font-black",
                  activeTab === 'assignments' ? "bg-white text-indigo-700" : "bg-indigo-100 text-indigo-700"
                )}>
                  {tasks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: WORKMAP TIMELINE */}
        {activeTab === 'workmap' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-indigo-600" />
                  Lịch Workmap Bài Tập Tự Học Cá Nhân
                </h2>
                <p className="text-slate-500 mt-1 text-xs flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Bấm vào bài tập để <strong>Làm bài Trắc nghiệm Quiz</strong> hoặc <strong>Xem Khung Dàn Ý (Outline) Bài Luận</strong> do Giáo viên đã duyệt.
                </p>
              </div>

              {/* View Controls & Detail Modal Trigger */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowDetailWorkmapModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Chi Tiết Workmap & Tải LU</span>
                </button>

                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPastDaysView('compact')}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
                      pastDaysView === 'compact'
                        ? "bg-white text-indigo-600 shadow-md border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Gọn (1 ngày quá khứ)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPastDaysView('full')}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
                      pastDaysView === 'full'
                        ? "bg-white text-indigo-600 shadow-md border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Xem nhiều ngày hơn (Cả tuần)
                  </button>
                </div>
              </div>
            </div>

        {/* Workmap Day Columns Grid Timeline */}
        <div className="flex gap-4 min-w-max pb-8">
          {dayColumns.map((col, idx) => {
            const totalLU = col.tasks.reduce((sum, t) => sum + t.lu, 0);
            const isOverloaded = totalLU > 5.0;
            const isWarning = totalLU > 3.5 && totalLU <= 5.0;

            return (
              <div key={idx} className="flex flex-col gap-4 w-[210px] shrink-0">
                {/* Day Header with LU Meter */}
                <div className={clsx(
                  "rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all border relative overflow-hidden",
                  col.isToday 
                    ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-105 origin-bottom" 
                    : "bg-white text-slate-700 border-slate-200 shadow-xs"
                )}>
                  <div className={clsx("text-[10px] font-black uppercase tracking-widest", col.isToday ? "text-indigo-200" : "text-slate-500")}>
                    {col.dayName}
                  </div>
                  <div className="text-2xl font-black mt-0.5 mb-1 tracking-tight">
                    {col.dateStr}
                  </div>

                  {/* Daily LU Workload Meter */}
                  <div className="w-full mt-1.5 pt-2 border-t border-slate-200/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black px-1">
                      <span className={col.isToday ? "text-indigo-100" : "text-slate-500"}>Tổng tải:</span>
                      <span className={clsx(
                        isOverloaded ? "text-rose-500 font-bold" : isWarning ? "text-amber-500" : col.isToday ? "text-white" : "text-emerald-600"
                      )}>
                        {totalLU.toFixed(1)} / 5.0 LU
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={clsx(
                          "h-full rounded-full transition-all duration-500",
                          isOverloaded ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(100, (totalLU / 5.0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {col.isToday && (
                    <div className="mt-2 bg-white/20 text-white text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-xs">
                      Hôm nay
                    </div>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="flex flex-col gap-3">
                  {col.tasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl h-28 flex items-center justify-center bg-slate-50/50">
                      <span className="text-slate-400 text-xs font-bold">Không có bài tập</span>
                    </div>
                  ) : (
                    col.tasks.map(task => {
                      const quizRes = task.isQuiz && task.taskRef ? quizResults[task.taskRef.id] : null;

                      return (
                        <div 
                          key={task.id} 
                          onClick={() => {
                            if (task.isQuiz) {
                              const targetTask: Task = task.taskRef || {
                                id: task.id,
                                title: task.title,
                                type: 'quiz',
                                class_id: studentProfile.classId,
                                subject_id: task.subject,
                                deadline: '2026-07-25',
                                isGroup: false
                              };
                              setSelectedQuizTask(targetTask);
                            } else {
                              setSelectedEssayTask(task);
                            }
                          }}
                          className={clsx(
                            "rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 group border border-transparent shadow-md relative overflow-hidden",
                            colorStyles[task.color]
                          )}
                        >
                          <div className="text-[10px] font-black uppercase opacity-90 mb-1 flex items-center justify-between">
                            <span>{task.subject}</span>
                            {task.isQuiz ? (
                              <span className="bg-amber-300 text-amber-950 text-[9px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-1 shadow-2xs">
                                <Play className="w-2.5 h-2.5 fill-amber-950" /> Quiz
                              </span>
                            ) : task.isEssay ? (
                              <span className="bg-white/20 text-[9px] px-1.5 py-0.5 rounded-md font-black">
                                Essay
                              </span>
                            ) : null}
                          </div>

                          <div className="font-extrabold text-sm leading-snug mb-3 line-clamp-2">
                            {task.title}
                          </div>

                          {quizRes && (
                            <div className="mb-2 bg-emerald-900/40 text-emerald-100 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-300/30 flex items-center justify-between">
                              <span>🎯 Đã làm bài</span>
                              <span>{quizRes.score}/{quizRes.totalQuestions} ({quizRes.percentage}%)</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1.5 border-t border-white/20">
                            <div className={clsx("text-[10px] px-2 py-0.5 rounded-lg font-black flex items-center gap-1", badgeStyles[task.color])}>
                              {task.lu} LU ({Math.round(task.lu * 30)}m)
                            </div>
                            <span className="text-[10px] font-black underline opacity-90 group-hover:opacity-100 flex items-center gap-0.5">
                              {task.isQuiz ? 'Vào làm ngay ➔' : 'Xem dàn ý ➔'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* TAB 2: LÀM BÀI & BÀI TẬP */}
    {activeTab === 'assignments' && (
      <div className="space-y-6">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-blue-100 border border-white/30 px-3 py-1 rounded-full">
                {studentProfile.classId ? `Lớp ${studentProfile.classId}` : 'Chưa chọn lớp'} • Hệ Thống Bài Tập
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
                Danh Sách Bài Tập & Giao Diện Làm Bài
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm font-semibold mt-1 max-w-2xl">
                Lựa chọn bài tập để tiến hành làm trắc nghiệm Quiz trực tiếp hoặc xem dàn ý chi tiết bài luận Essay do Giáo viên đã phê duyệt.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                {filteredAssignments.length}
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-white">Tổng bài tập được giao</div>
                <div className="text-blue-200">Cho Lớp {studentProfile.classId || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={assignmentsSearch}
              onChange={(e) => setAssignmentsSearch(e.target.value)}
              placeholder="Tìm tên bài tập..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={assignmentsFilterType}
              onChange={(e) => setAssignmentsFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả loại bài tập</option>
              <option value="quiz">🎯 Trắc nghiệm Quiz</option>
              <option value="essay">📝 Bài luận Essay</option>
            </select>

            <select
              value={assignmentsFilterStatus}
              onChange={(e) => setAssignmentsFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">⏳ Chưa làm bài</option>
              <option value="completed">✅ Đã làm bài</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
              📚
            </div>
            <h3 className="text-lg font-black text-slate-900">Không tìm thấy bài tập nào</h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
              {tasks.length === 0 
                ? `Lớp ${studentProfile.classId} hiện chưa có bài tập nào được giao từ giáo viên trên hệ thống database.`
                : 'Không có bài tập nào phù hợp với bộ lọc đã chọn.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((task) => {
              const quizRes = quizResults[task.id];
              const isDone = !!quizRes;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {task.subject_id || 'MÔN HỌC'}
                      </span>
                      <span className={clsx(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1",
                        task.type === 'quiz' 
                          ? "bg-amber-50 text-amber-800 border-amber-200" 
                          : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      )}>
                        {task.type === 'quiz' ? '🎯 Trắc nghiệm Quiz' : '📝 Bài luận Essay'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-2">
                        <span>Lớp {task.class_id}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Hạn nộp: {task.deadline || 'Không giới hạn'}
                        </span>
                      </p>
                    </div>

                    {isDone && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center justify-between">
                        <span>🎯 Đã hoàn thành</span>
                        <span className="font-black text-emerald-700">{quizRes.score}/{quizRes.totalQuestions} ({quizRes.percentage}%)</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {task.type === 'quiz' ? '1.5 LU (45m)' : '2.5 LU (75m)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (task.type === 'quiz') {
                          setSelectedQuizTask(task);
                        } else {
                          setSelectedEssayTask({
                            id: task.id,
                            subject: task.subject_id || 'Ngữ văn',
                            title: task.title,
                            lu: 2.5,
                            color: 'blue',
                            isEssay: true,
                            taskRef: task
                          });
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl font-black text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {task.type === 'quiz' ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{isDone ? 'Làm lại Quiz' : 'Vào làm ngay'}</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xem Dàn Ý Essay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
  </div>

      {/* Student Workmap Detail Modal (Matches User Screenshot) */}
      <StudentWorkmapDetailModal
        isOpen={showDetailWorkmapModal}
        onClose={() => setShowDetailWorkmapModal(false)}
        onSelectQuizTask={(task) => {
          setShowDetailWorkmapModal(false);
          setSelectedQuizTask(task);
        }}
        onSelectEssayTask={(task) => {
          setShowDetailWorkmapModal(false);
          setSelectedEssayTask({
            id: task.id,
            subject: task.subject_id || 'Ngữ văn',
            title: task.title,
            lu: 2.5,
            color: 'blue',
            isEssay: true,
            taskRef: task
          });
        }}
      />

      {/* Student Onboarding Profile Modal */}
      <StudentOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Interactive Student Quiz Player Modal */}
      <StudentQuizPlayerModal
        isOpen={!!selectedQuizTask}
        onClose={() => setSelectedQuizTask(null)}
        task={selectedQuizTask}
      />

      {/* Essay Detail & Outline Guidance Modal */}
      <AnimatePresence>
        {selectedEssayTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEssayTask(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                        Môn {selectedEssayTask.subject}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                        Bài Luận Essay
                      </span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-white mt-1">
                      {selectedEssayTask.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEssayTask(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                {/* 1. Process Steps Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Tiến Trình Thực Hiện Tự Học (Giáo Viên Đã Phân Bổ)
                  </h3>

                  <div className="space-y-2">
                    {processSteps.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs font-semibold text-slate-500 text-center">
                        Chưa có thông tin phân bổ tiến trình thực hiện cho bài tập này trong cơ sở dữ liệu.
                      </div>
                    ) : (
                      processSteps.map((step, i) => (
                        <div key={step.id || i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900">{step.stepName}</div>
                              {step.note && <div className="text-[11px] text-slate-500 font-semibold italic">{step.note}</div>}
                            </div>
                          </div>
                          <span className="text-xs font-black text-blue-600 bg-white border border-blue-100 px-2.5 py-1 rounded-lg shrink-0">
                            {step.minutes} phút
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Outline Guidance */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Khung Dàn Ý Gợi Ý Chi Tiết (AI Outline)
                    </h3>

                    <span className={clsx(
                      "text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border",
                      isOutlineApproved 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {isOutlineApproved ? '🟢 Đã Độc Quyền Duyệt Bởi Giáo Viên' : '⚪ Chưa Thông Qua Outline'}
                    </span>
                  </div>

                  {isOutlineApproved ? (
                    <div className="space-y-2.5">
                      {outlineItems.length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          Chưa có dàn ý chi tiết trong cơ sở dữ liệu cho bài tập này.
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-slate-500 font-semibold mb-3">
                            Tích chọn từng mục dàn ý khi em đã triển khai xong đoạn văn tương ứng trong bài essay:
                          </p>

                          {outlineItems.map((item, idx) => {
                            const isChecked = !!checkedOutlineIds[item.id];
                            return (
                              <div 
                                key={item.id} 
                                onClick={() => toggleOutlineCheck(item.id)}
                                className={clsx(
                                  "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-xs",
                                  isChecked 
                                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
                                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800"
                                )}
                              >
                                <button type="button" className="mt-0.5 shrink-0 text-indigo-600">
                                  {isChecked ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                                </button>
                                <span className={clsx("font-extrabold leading-relaxed", isChecked && "line-through opacity-75")}>
                                  <span className="text-indigo-600 font-black mr-1">#{idx + 1}</span> {item.text}
                                </span>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      Giáo viên lựa chọn không hiển thị khung dàn ý cho bài tập này. Học sinh tự do triển khai bài viết theo ý tưởng cá nhân.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEssayTask(null)}
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-extrabold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
