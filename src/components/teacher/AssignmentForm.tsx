'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { TaskType, Task } from '@/lib/engine/types';
import { WorkmapCalendar } from './WorkmapCalendar';
import { WorkloadPreviewModal } from './WorkloadPreviewModal';
import EssaySetup, { ProcessStepItem, OutlineItem } from './EssaySetup';
import { 
  fetchQuestionPackages, 
  fetchQuestionsForPackage, 
  saveQuestionInDb,
  saveAuditLog,
  QuestionPackage,
  QuestionItem
} from '@/lib/api';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Plus, 
  ArrowLeft, 
  RotateCcw, 
  Folder, 
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  X
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import clsx from 'clsx';
import { DatePicker } from '@/components/ui/date-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_CLASS_ID, normalizeClassId } from '@/lib/class-utils';
import {
  DEFAULT_SECONDS_PER_LEVEL,
  LEVEL_LABELS,
  QUESTION_LEVELS,
  calculateQuizDuration,
  type QuestionLevel,
} from '@/lib/engine/calculator';
import {
  TASK_TYPE_OPTIONS,
  GROUP_MEETING_MINUTES,
  GROUP_REHEARSAL_MINUTES,
  getTemplateSteps,
  isDecomposableType,
} from '@/lib/engine/task-templates';
import {
  buildDateRange,
  buildExistingMinutesByDate,
  withPlannedDates,
} from '@/lib/engine/step-scheduler';

const DRAFT_STORAGE_KEY = 'nexus_assignment_form_draft_v1';

interface AssignmentFormProps {
  onNavigateToQuestionBank?: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ onNavigateToQuestionBank }) => {
  const { autoScheduleTask, selectedDate, classes, subjects, workmap, tasks } = useStore();

  const availableClasses = classes || [];
  const availableSubjects = subjects || [];

  // Form State
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('quiz');
  const [classId, setClassId] = useState(availableClasses[0] || DEFAULT_CLASS_ID);
  const [subjectId, setSubjectId] = useState(availableSubjects.includes('Ngữ văn') ? 'Ngữ văn' : availableSubjects[0] || 'Ngữ văn');
  const [isGroup, setIsGroup] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [deadline, setDeadline] = useState(selectedDate || format(addDays(new Date(), 2), 'yyyy-MM-dd'));
  const [minutes, setMinutes] = useState(30);

  // Toggle Workmap Calendar view (Default collapsed to prevent scrolling)
  const [showWorkmapCalendar, setShowWorkmapCalendar] = useState(false);

  // Quiz Package State
  const [availablePackages, setAvailablePackages] = useState<QuestionPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedPackageQuestions, setSelectedPackageQuestions] = useState<QuestionItem[]>([]);
  const [isLoadingPkgQuestions, setIsLoadingPkgQuestions] = useState<boolean>(false);

  // Định mức giây/câu theo mức độ, giáo viên chỉnh được trước khi giao bài
  const [secondsPerLevel, setSecondsPerLevel] = useState<Record<QuestionLevel, number>>(DEFAULT_SECONDS_PER_LEVEL);
  const [showLevelRateEditor, setShowLevelRateEditor] = useState<boolean>(false);
  // Đánh dấu khi giáo viên tự gõ số phút, để không bị ma trận độ khó ghi đè
  const [minutesManuallySet, setMinutesManuallySet] = useState<boolean>(false);

  const quizDuration = useMemo(
    () => calculateQuizDuration(selectedPackageQuestions, secondsPerLevel),
    [selectedPackageQuestions, secondsPerLevel]
  );

  // Breakdown & Preview Modal State
  const [analyzing, setAnalyzing] = useState(false);
  const [submittedTaskTitle, setSubmittedTaskTitle] = useState<string | null>(null);
  interface BreakdownStep { name: string; lu: number; min: number; dayOffset: number; date?: string; }
  const [breakdown, setBreakdown] = useState<BreakdownStep[] | null>(null);
  const [showWorkloadPreview, setShowWorkloadPreview] = useState<boolean>(false);
  // Đánh dấu giáo viên đã tự đổi lịch của ít nhất một bước
  const [hasManualStepDates, setHasManualStepDates] = useState<boolean>(false);

  // Essay Specific State (Outline & Process Steps)
  const [topic, setTopic] = useState<string>('');
  const [showConfirmPromptModal, setShowConfirmPromptModal] = useState<boolean>(false);
  const [hasConfirmedPrompt, setHasConfirmedPrompt] = useState<boolean>(false);
  // Mỗi lần xác nhận prompt lại kích hoạt AI phân tích với nội dung mới nhất
  const [promptVersion, setPromptVersion] = useState<number>(0);
  const [essaySteps, setEssaySteps] = useState<ProcessStepItem[]>([]);
  const [essayOutline, setEssayOutline] = useState<OutlineItem[]>([]);
  const [isOutlineApproved, setIsOutlineApproved] = useState<boolean>(true);

  // Load packages from Supabase
  useEffect(() => {
    fetchQuestionPackages().then(pkgs => {
      setAvailablePackages(pkgs);
      if (pkgs.length > 0 && !selectedPackageId) {
        setSelectedPackageId(pkgs[0].id);
      }
    });
  }, []);

  // Sync selected package questions
  useEffect(() => {
    if (selectedPackageId) {
      setIsLoadingPkgQuestions(true);
      fetchQuestionsForPackage(selectedPackageId).then(qList => {
        setSelectedPackageQuestions(qList);
        setIsLoadingPkgQuestions(false);
        // Gói mới thì tính lại thời gian từ ma trận độ khó
        setMinutesManuallySet(false);
      });
    }
  }, [selectedPackageId]);

  // Thời gian làm quiz suy từ ma trận độ khó L1-L4, trừ khi giáo viên tự nhập số phút
  useEffect(() => {
    if (type !== 'quiz' || minutesManuallySet) return;
    if (quizDuration.totalQuestions === 0) return;
    setMinutes(quizDuration.totalMinutes);
  }, [type, quizDuration, minutesManuallySet]);

  // Đổi sang dạng nguyên khối không phải trắc nghiệm (ví dụ Tự luận) thì bỏ số phút
  // suy từ ma trận độ khó của gói câu hỏi, vì nó không còn ý nghĩa cho dạng bài này.
  useEffect(() => {
    if (type === 'quiz' || isDecomposableType(type)) return;
    setMinutes(m => (m >= 15 ? m : 30));
  }, [type]);

  // Load draft from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.type) setType(parsed.type);
        if (parsed.classId) setClassId(parsed.classId);
        if (parsed.subjectId) setSubjectId(parsed.subjectId);
        if (typeof parsed.isGroup === 'boolean') setIsGroup(parsed.isGroup);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.deadline) setDeadline(parsed.deadline);
        if (parsed.minutes) setMinutes(parsed.minutes);
        if (parsed.step) setStep(parsed.step);
        if (parsed.selectedPackageId) setSelectedPackageId(parsed.selectedPackageId);
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, []);

  // Auto-save draft to sessionStorage on state change
  useEffect(() => {
    try {
      if (!submittedTaskTitle) {
        const draftData = {
          step, title, type, classId, subjectId, isGroup, startDate, deadline, minutes, selectedPackageId
        };
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      }
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  }, [step, title, type, classId, subjectId, isGroup, startDate, deadline, minutes, selectedPackageId, submittedTaskTitle]);

  // Sync deadline with selectedDate when user clicks on calendar
  useEffect(() => {
    if (selectedDate) setDeadline(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (availableClasses.length > 0 && !classes?.includes(classId)) {
      setClassId(normalizeClassId(availableClasses[0]) || DEFAULT_CLASS_ID);
    }
    if (availableSubjects.length > 0 && !subjects?.includes(subjectId)) setSubjectId(availableSubjects[0]);
  }, [classes, subjects]);

  // Tải nền của lớp theo từng ngày, để không xếp bài mới vào ngày đã kín
  const existingMinutesByDate = useMemo(
    () => buildExistingMinutesByDate(
      workmap || [],
      tasks || [],
      (task) => !task || normalizeClassId(task.class_id) === normalizeClassId(classId)
    ),
    [workmap, tasks, classId]
  );

  const scheduleDates = useMemo(
    () => buildDateRange(startDate, deadline),
    [startDate, deadline]
  );

  /** Xếp lại ngày cho toàn bộ các bước theo khoảng ngày và tải hiện có */
  const planBreakdown = (steps: BreakdownStep[], keepManualDates: boolean): BreakdownStep[] =>
    withPlannedDates(
      steps.map(s => ({ ...s, date: keepManualDates ? s.date : undefined })),
      scheduleDates,
      existingMinutesByDate
    );

  // Đổi ngày giao / hạn nộp thì xếp lại lịch các bước cho khớp khoảng thời gian mới
  useEffect(() => {
    if (!breakdown || breakdown.length === 0) return;
    const replanned = planBreakdown(breakdown, hasManualStepDates);
    const changed = replanned.some((s, i) => s.date !== breakdown[i].date);
    if (changed) setBreakdown(replanned);
  }, [startDate, deadline]);

  const resetForm = () => {
    setTitle('');
    setStep(1);
    setBreakdown(null);
    setSubmittedTaskTitle(null);
    setHasConfirmedPrompt(false);
    setHasManualStepDates(false);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
  };

  const isDecomposable = isDecomposableType(type);
  const isGroupOnlyType = !!TASK_TYPE_OPTIONS.find(o => o.value === type)?.groupOnly;

  const handleFormSubmit = () => {
    if (step < 3) {
      if (step === 1 && !title) {
        alert('Vui lòng nhập tên bài tập!');
        return;
      }
      setStep(step + 1);
      return;
    }

    if (!title) {
      alert('Vui lòng nhập tên bài tập!');
      setStep(1);
      return;
    }

    if (type === 'quiz' && availablePackages.length === 0) {
      alert('Chưa có gói câu hỏi nào. Vui lòng chuyển sang mục "Ngân hàng câu hỏi" để tạo gói!');
      onNavigateToQuestionBank?.();
      return;
    }

    if (type === 'quiz' && selectedPackageQuestions.length === 0) {
      alert('Gói câu hỏi đã chọn chưa có câu hỏi nào. Vui lòng chọn gói khác!');
      return;
    }
    
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      
      let generatedSteps: BreakdownStep[] | null = breakdown;
      if (isDecomposable) {
        if (essaySteps.length > 0) {
          generatedSteps = essaySteps.map((s, i) => ({
            name: s.stepName,
            min: s.minutes,
            lu: s.minutes / 30,
            dayOffset: Math.min(i, 6)
          }));
          const totalMin = essaySteps.reduce((acc, s) => acc + s.minutes, 0);
          setMinutes(totalMin);
        } else {
          // Bộ bước mặc định theo dạng bài, đã cộng phần điều phối nếu là bài nhóm
          generatedSteps = getTemplateSteps(type, isGroup).map(s => ({
            name: s.name,
            min: s.min,
            lu: s.min / 30,
            dayOffset: s.dayOffset,
          }));
          setMinutes(generatedSteps.reduce((acc, s) => acc + s.min, 0));
        }
        // Gộp các bước liên quan vào cùng một ngày thay vì rải mỗi ngày một bước,
        // đồng thời né những ngày lớp đã kín tải.
        generatedSteps = planBreakdown(generatedSteps, hasManualStepDates);
        setBreakdown(generatedSteps);
      }
      setShowWorkloadPreview(true);
    }, 800);
  };

  const handleConfirmSchedule = async (
    overrideReason?: string,
    overrideSeverity: 'critical' | 'soft' = 'critical',
    overrideExcessMinutes?: number
  ) => {
    const normalizedClassId = normalizeClassId(classId) || DEFAULT_CLASS_ID;
    const newTask: Task = {
      id: crypto.randomUUID(),
      title, 
      type, 
      class_id: normalizedClassId, 
      subject_id: subjectId, 
      deadline, 
      isGroup,
      outline: isDecomposable ? essayOutline : [],
      essay_steps: isDecomposable ? essaySteps : [],
      is_outline_approved: isDecomposable ? isOutlineApproved : false
    };

    if (overrideReason) {
      const res = await saveAuditLog({
        task_id: newTask.id,
        task_title: title,
        class_id: normalizedClassId,
        subject_id: subjectId,
        reason: overrideReason,
        severity: overrideSeverity,
        excess_minutes: overrideExcessMinutes,
        deadline,
      });
      if (!res.success) {
        alert('Không lưu được nhật ký ghi đè: ' + (res.error?.message || 'lỗi không xác định'));
      }
    }

    if (isDecomposable && breakdown) {
      await autoScheduleTask(newTask, startDate, deadline, minutes, breakdown);
    } else {
      await autoScheduleTask(newTask, startDate, deadline, minutes);
    }

    if (type === 'quiz' && selectedPackageQuestions.length > 0) {
      for (const q of selectedPackageQuestions) {
        await saveQuestionInDb({
          task_id: newTask.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          level: q.level,
          explanation: q.explanation
        });
      }
    }

    setSubmittedTaskTitle(title);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
  };

  const selectedPkgMeta = availablePackages.find(p => p.id === selectedPackageId);

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      {/* 1. Compact Workmap Collapsible Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setShowWorkmapCalendar(!showWorkmapCalendar)}
          className="w-full px-5 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-slate-800">
              Lịch Workmap Theo Dõi Tải Bài Tập (Lớp {classId})
            </span>
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
              • Nhấn để {showWorkmapCalendar ? 'thu gọn' : 'xem lịch chi tiết'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600">
            <span>{showWorkmapCalendar ? 'Thu gọn lịch' : 'Xem lịch Workmap'}</span>
            {showWorkmapCalendar ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showWorkmapCalendar && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-4 border-t border-slate-200"
            >
              <WorkmapCalendar classId={classId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Main Form Card */}
      {submittedTaskTitle ? (
        <div className="glass-card rounded-3xl p-6 bg-emerald-50/90 border border-emerald-200 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-950">Giao Bài Tập Thành Công!</h2>
              <p className="text-xs font-semibold text-emerald-700">
                Bài tập <strong className="font-extrabold text-emerald-900">"{submittedTaskTitle}"</strong> đã được lưu và xếp lịch thành công.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tạo Bài Tập Mới
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/40 space-y-5">
          {/* Header Row & Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Tạo Bài Tập Mới
              </h1>
              <p className="text-xs text-slate-500 font-semibold">Giao bài nhanh chóng & tự động xếp lịch.</p>
            </div>

            {/* Compact Step Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              {[
                { num: 1, label: 'Bước 1: Thông tin' },
                { num: 2, label: 'Bước 2: Thời hạn' },
                { num: 3, label: 'Bước 3: Cấu hình' }
              ].map(item => (
                <button
                  type="button"
                  key={item.num}
                  onClick={() => {
                    if (item.num > 1 && !title) {
                      alert('Vui lòng nhập tên bài tập trước!');
                      return;
                    }
                    if (item.num === 3 && isDecomposable && !hasConfirmedPrompt) {
                      setShowConfirmPromptModal(true);
                      return;
                    }
                    setStep(item.num);
                  }}
                  className={clsx(
                    "px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer",
                    step === item.num
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : step > item.num
                      ? "text-blue-700 hover:bg-blue-50"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Step Contents */}
          <div className="space-y-4 min-h-[220px]">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Lớp học</label>
                    <select
                      value={classId}
                      onChange={e => setClassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {availableClasses.map(c => <option key={c} value={c}>Lớp {c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Bộ môn</label>
                    <select
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {availableSubjects.map(s => <option key={s} value={s}>Môn {s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Tên Bài Tập</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 placeholder:font-semibold"
                    placeholder="Nhập tên bài tập..." 
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Dạng Bài</label>
                    <select
                      value={type}
                      onChange={e => {
                        const newType = e.target.value as TaskType;
                        setType(newType);
                        // Thuyết trình nhóm thì bắt buộc là bài làm nhóm
                        if (TASK_TYPE_OPTIONS.find(o => o.value === newType)?.groupOnly) setIsGroup(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {TASK_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Hình Thức</label>
                    <select
                      value={isGroup ? 'group' : 'individual'}
                      onChange={e => setIsGroup(e.target.value === 'group')}
                      disabled={isGroupOnlyType}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="individual">Cá nhân</option>
                      <option value="group">Làm nhóm</option>
                    </select>
                    {isGroup && (
                      <p className="text-[11px] font-semibold text-indigo-700 leading-relaxed">
                        Bài nhóm được cộng thêm {GROUP_MEETING_MINUTES} phút họp phân công và{' '}
                        {GROUP_REHEARSAL_MINUTES} phút tập duyệt cho mỗi thành viên.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePicker
                    label="Ngày Giao"
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <DatePicker
                    label="Hạn Nộp"
                    value={deadline}
                    onChange={setDeadline}
                  />
                </div>
              </div>
            )}

            {isDecomposable && (
              <div className={clsx(step !== 3 && 'hidden')}>
                <EssaySetup
                  title={title}
                  topic={topic}
                  subjectId={subjectId}
                  classId={classId}
                  taskType={type}
                  isGroup={isGroup}
                  promptVersion={promptVersion}
                  onStepsChange={(steps) => {
                    setEssaySteps(steps);
                    const totalMin = steps.reduce((acc, s) => acc + s.minutes, 0);
                    setMinutes(totalMin);
                  }}
                  onOutlineChange={(outline, isApproved) => {
                    setEssayOutline(outline);
                    setIsOutlineApproved(isApproved);
                  }}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in">
                {!isDecomposable && type !== 'quiz' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" /> Số Phút Dự Kiến
                    </label>
                    <input 
                      type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} min={15} step={15}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-base font-black text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {type === 'quiz' && (
                  <div className="space-y-4">
                    {availablePackages.length === 0 ? (
                      <div className="text-center py-6 bg-blue-50/70 rounded-2xl border border-blue-200/80 p-5 space-y-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Chưa có gói câu hỏi nào trong Ngân Hàng</h3>
                          <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto mt-0.5">
                            Vui lòng chuyển sang mục <strong className="text-blue-700">"2. Ngân hàng câu hỏi"</strong> để tạo gói mới hoặc upload file CSV trước khi giao bài.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateToQuestionBank?.()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Folder className="w-4 h-4" /> Sang Ngân Hàng Câu Hỏi Để Tạo Gói
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                            Chọn Gói Câu Hỏi (Từ Supabase DB)
                          </label>
                          <select
                            value={selectedPackageId}
                            onChange={e => setSelectedPackageId(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer shadow-sm"
                          >
                            {availablePackages.map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.title} • Môn {pkg.subject} - {pkg.questions_count || 0} câu hỏi
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Package Preview Card */}
                        {selectedPkgMeta && (
                          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-blue-600" />
                                <strong className="text-sm font-black text-blue-950">{selectedPkgMeta.title}</strong>
                              </div>
                              <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-sm">
                                {selectedPackageQuestions.length} câu hỏi sẵn có
                              </span>
                            </div>

                            {/* Ma trận độ khó và thời gian quy đổi từng mức */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {QUESTION_LEVELS.map(level => {
                                const colorByLevel: Record<QuestionLevel, string> = {
                                  l1: 'text-emerald-600',
                                  l2: 'text-blue-600',
                                  l3: 'text-amber-600',
                                  l4: 'text-rose-600',
                                };
                                return (
                                  <div key={level} className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{LEVEL_LABELS[level]}</div>
                                    <div className={clsx('text-sm font-black', colorByLevel[level])}>
                                      {quizDuration.countByLevel[level]} câu
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                      {quizDuration.minutesByLevel[level]} phút
                                      <span className="text-slate-400 font-semibold"> ({secondsPerLevel[level]}s/câu)</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Tổng thời gian suy từ ma trận độ khó */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-blue-200/70 text-xs">
                              <span className="font-bold text-blue-950">
                                Tổng theo ma trận độ khó:{' '}
                                <strong className="font-black">
                                  {quizDuration.totalMinutes} phút ({quizDuration.totalLU} LU)
                                </strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowLevelRateEditor(!showLevelRateEditor)}
                                className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline underline-offset-2 cursor-pointer text-left sm:text-right"
                              >
                                {showLevelRateEditor ? 'Ẩn định mức' : 'Chỉnh định mức giây/câu'}
                              </button>
                            </div>

                            {showLevelRateEditor && (
                              <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 animate-in fade-in duration-200">
                                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                                  Định mức mặc định lấy trung bình khoảng thời gian chuẩn cho học sinh THPT.
                                  Thầy/cô chỉnh lại nếu đề của mình nặng hoặc nhẹ hơn thông thường.
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {QUESTION_LEVELS.map(level => (
                                    <div key={level} className="space-y-1">
                                      <label className="block text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                                        {LEVEL_LABELS[level]}
                                      </label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={5}
                                          step={5}
                                          value={secondsPerLevel[level]}
                                          onWheel={e => e.currentTarget.blur()}
                                          onChange={e => {
                                            const val = Math.max(5, parseInt(e.target.value) || 0);
                                            setSecondsPerLevel(prev => ({ ...prev, [level]: val }));
                                            setMinutesManuallySet(false);
                                          }}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-blue-600 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">giây</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSecondsPerLevel(DEFAULT_SECONDS_PER_LEVEL);
                                    setMinutesManuallySet(false);
                                  }}
                                  className="text-[11px] font-extrabold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" /> Khôi phục định mức mặc định
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customizable Duration / Minutes */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-blue-600" /> Thời gian làm bài dự kiến
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={minutes}
                              onChange={e => {
                                setMinutes(Math.max(5, parseInt(e.target.value) || 0));
                                setMinutesManuallySet(true);
                              }}
                              min={5}
                              step={5}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-black text-blue-600 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-xs font-bold text-slate-500">
                              {minutesManuallySet ? 'phút (thầy/cô tự đặt)' : 'phút (theo ma trận độ khó)'}
                            </span>
                            {minutesManuallySet && quizDuration.totalQuestions > 0 && (
                              <button
                                type="button"
                                onClick={() => setMinutesManuallySet(false)}
                                className="text-[11px] font-extrabold text-blue-700 hover:text-blue-900 underline underline-offset-2 cursor-pointer"
                              >
                                Tính lại theo độ khó
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !title) {
                    alert('Vui lòng nhập tên bài tập!');
                    return;
                  }
                  if (step === 2 && isDecomposable && !hasConfirmedPrompt) {
                    setShowConfirmPromptModal(true);
                    return;
                  }
                  setStep(step + 1);
                }}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                Tiếp tục <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={analyzing}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {analyzing ? (
                  <span className="animate-pulse">Đang xử lý...</span>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Phân tích & Xếp lịch</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Breakdown AI Section */}
      {breakdown && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Phân Rã Bài Tập Bằng AI
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                AI đã gộp các bước liên quan vào cùng ngày và né ngày lớp đã kín tải.
                Thầy/cô đổi trực tiếp ngày của từng bước ở cột bên phải.
              </p>
            </div>

            {hasManualStepDates && (
              <button
                type="button"
                onClick={() => {
                  setHasManualStepDates(false);
                  setBreakdown(planBreakdown(breakdown, false));
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Xếp Lại Theo Gợi Ý AI
              </button>
            )}
          </div>

          <div className="space-y-3">
            {breakdown.map((stepItem, idx) => {
              const stepDate = stepItem.date
                || format(addDays(new Date(startDate), stepItem.dayOffset), 'yyyy-MM-dd');
              const prevDate = idx > 0 ? (breakdown[idx - 1].date || '') : '';
              const isSameDayAsPrev = !!prevDate && prevDate === stepDate;

              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 text-xs">{stepItem.name}</div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {stepItem.min} phút • {(stepItem.lu).toFixed(1)} LU
                        {isSameDayAsPrev && (
                          <span className="ml-1.5 text-indigo-600 font-extrabold">• Làm chung ngày với bước {idx}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={stepDate}
                      min={startDate}
                      max={deadline}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (!newDate) return;
                        setHasManualStepDates(true);
                        setBreakdown(breakdown.map((s, i) => i === idx ? { ...s, date: newDate } : s));
                      }}
                      className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="button"
            onClick={() => setShowWorkloadPreview(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Xem Phân Bổ Workload & Giao Bài
          </button>
        </div>
      )}

      {/* 3. Workload Workmap Distribution Preview Modal */}
      <WorkloadPreviewModal
        isOpen={showWorkloadPreview}
        onClose={() => setShowWorkloadPreview(false)}
        onConfirm={async (overrideReason, severity, excessMinutes) => {
          setShowWorkloadPreview(false);
          await handleConfirmSchedule(overrideReason, severity, excessMinutes);
        }}
        taskData={{
          title,
          type,
          classId,
          subjectId,
          startDate,
          deadline,
          minutes,
          isGroup
        }}
        breakdownSteps={breakdown}
        onUpdateDeadline={(newDeadline) => setDeadline(newDeadline)}
        onUpdateIsGroup={(newGroup) => setIsGroup(newGroup)}
      />

      {/* 4. Prompt Confirmation Modal before AI analysis */}
      <AnimatePresence>
        {showConfirmPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmPromptModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
            >
              <div className="bg-white border-b border-slate-200/80 p-5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                        Xác Nhận Nội Dung Trước Khi AI Phân Tích
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        Rà Soát Đề Bài Cho Trợ Lý AI
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowConfirmPromptModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 bg-slate-50/50 text-xs">
                <p className="text-slate-600 font-semibold leading-relaxed">
                  Hệ thống AI sẽ dựa trên <strong>Tên Bài Tập</strong> và <strong>Nội Dung Chi Tiết</strong> dưới đây để tính số phút và tự động sinh Khung Dàn Ý. Vui lòng rà soát lại trước khi sang Bước 3:
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Tên bài tập / Chủ đề essay
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-extrabold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nhập tên bài tập..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    Yêu cầu chi tiết đề bài (Prompt bổ sung cho AI)
                  </label>
                  <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                    placeholder="Ví dụ: Viết một bài văn nghị luận xã hội 500 từ về tư duy tự học và kỷ luật bản thân trong kỷ nguyên số..."
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 font-semibold flex items-center justify-between">
                  <span>Môn học: <strong>{subjectId}</strong> (Lớp {classId})</span>
                  <span>Hạn nộp: <strong>{deadline}</strong></span>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmPromptModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim()) {
                      alert('Vui lòng nhập tên bài tập!');
                      return;
                    }
                    setHasConfirmedPrompt(true);
                    setShowConfirmPromptModal(false);
                    // Kích hoạt AI phân tích ngay với đúng prompt vừa nhập
                    setPromptVersion(v => v + 1);
                    setStep(3);
                  }}
                  className="px-5 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Xác Nhận & Sang Cấu Hình AI ➔
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
