'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { TaskType, Task } from '@/lib/engine/types';
import { WorkmapCalendar } from './WorkmapCalendar';
import { WorkloadPreviewModal } from './WorkloadPreviewModal';
import EssaySetup, { ProcessStepItem, OutlineItem } from './EssaySetup';
import { 
  fetchQuestionPackages, 
  fetchQuestionsForPackage, 
  saveQuestionInDb, 
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

const DRAFT_STORAGE_KEY = 'nexus_assignment_form_draft_v1';

interface AssignmentFormProps {
  onNavigateToQuestionBank?: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ onNavigateToQuestionBank }) => {
  const { autoScheduleTask, selectedDate, classes, subjects } = useStore();

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

  // Breakdown & Preview Modal State
  const [analyzing, setAnalyzing] = useState(false);
  const [submittedTaskTitle, setSubmittedTaskTitle] = useState<string | null>(null);
  interface BreakdownStep { name: string; lu: number; min: number; dayOffset: number; }
  const [breakdown, setBreakdown] = useState<BreakdownStep[] | null>(null);
  const [showWorkloadPreview, setShowWorkloadPreview] = useState<boolean>(false);

  // Essay Specific State (Outline & Process Steps)
  const [topic, setTopic] = useState<string>('');
  const [showConfirmPromptModal, setShowConfirmPromptModal] = useState<boolean>(false);
  const [hasConfirmedPrompt, setHasConfirmedPrompt] = useState<boolean>(false);
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

  // Sync selected package questions & auto calculate minutes
  useEffect(() => {
    if (selectedPackageId) {
      setIsLoadingPkgQuestions(true);
      fetchQuestionsForPackage(selectedPackageId).then(qList => {
        setSelectedPackageQuestions(qList);
        setIsLoadingPkgQuestions(false);
        const autoMin = Math.max(15, Math.ceil((qList.length * 90) / 60));
        setMinutes(autoMin);
      });
    }
  }, [selectedPackageId]);

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

  const resetForm = () => {
    setTitle('');
    setStep(1);
    setBreakdown(null);
    setSubmittedTaskTitle(null);
    setHasConfirmedPrompt(false);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
  };

  const isDecomposable = type !== 'quiz';

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
        } else if (type === 'essay') {
          generatedSteps = [
            { name: 'Đọc hiểu đề và xác định phạm vi nội dung', lu: 0.5, min: 15, dayOffset: 0 },
            { name: 'Tra cứu thông tin và kiểm tra lại tính xác thực', lu: 0.67, min: 20, dayOffset: 1 },
            { name: 'Xác định từ khóa/ý chính và luận điểm', lu: 0.33, min: 10, dayOffset: 1 },
            { name: 'Lập dàn ý chi tiết', lu: 0.33, min: 10, dayOffset: 2 },
            { name: 'Viết essay', lu: 1.5, min: 45, dayOffset: 3 },
            { name: 'Đọc lại bài, chỉnh sửa và hoàn thiện', lu: 0.33, min: 10, dayOffset: 4 },
            { name: 'Tổng hợp lại các tài liệu tham khảo', lu: 0.17, min: 5, dayOffset: 4 }
          ];
        } else if (type === 'chart') {
          generatedSteps = [
            { name: 'Đọc hiểu số liệu & xác định mục tiêu biểu đồ', lu: 0.5, min: 15, dayOffset: 0 },
            { name: 'Xử lý, tính toán số liệu & phân loại dữ liệu', lu: 0.67, min: 20, dayOffset: 1 },
            { name: 'Lựa chọn dạng biểu đồ & dựng khung/trục', lu: 0.5, min: 15, dayOffset: 1 },
            { name: 'Vẽ biểu đồ chi tiết & điền chú giải', lu: 1, min: 30, dayOffset: 2 },
            { name: 'Nhận xét, phân tích xu hướng & rút ra kết luận', lu: 0.83, min: 25, dayOffset: 3 },
            { name: 'Rà soát, kiểm tra độ chính xác & hoàn thiện', lu: 0.33, min: 10, dayOffset: 4 }
          ];
        } else {
          generatedSteps = [
            { name: 'Lên kế hoạch dự án', lu: 1, min: 30, dayOffset: 0 },
            { name: 'Thu thập dữ liệu', lu: 2, min: 60, dayOffset: 1 },
            { name: 'Thực hiện', lu: 3, min: 90, dayOffset: 3 },
            { name: 'Chuẩn bị thuyết trình', lu: 1, min: 30, dayOffset: 4 }
          ];
        }
        setBreakdown(generatedSteps);
      }
      setShowWorkloadPreview(true);
    }, 800);
  };

  const handleConfirmSchedule = async (overrideReason?: string) => {
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
      console.log('[Audit Log Override Saved]:', {
        taskId: newTask.id,
        title,
        classId,
        overrideReason,
        timestamp: new Date().toISOString()
      });
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
                      onChange={e => setType(e.target.value as TaskType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="quiz">Trắc nghiệm (Nguyên khối)</option>
                      <option value="chart">Biểu đồ (Chia nhỏ được)</option>
                      <option value="essay">Bài Luận (Chia nhỏ được)</option>
                      <option value="project">Dự án (Chia nhỏ được)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Hình Thức</label>
                    <select
                      value={isGroup ? 'group' : 'individual'}
                      onChange={e => setIsGroup(e.target.value === 'group')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="individual">Cá nhân</option>
                      <option value="group">Làm nhóm</option>
                    </select>
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

                            {/* Difficulty distribution breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Nhận biết</div>
                                <div className="text-sm font-black text-emerald-600">
                                  {selectedPackageQuestions.filter(q => q.level === 'l1').length} câu
                                </div>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Thông hiểu</div>
                                <div className="text-sm font-black text-blue-600">
                                  {selectedPackageQuestions.filter(q => q.level === 'l2').length} câu
                                </div>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Vận dụng</div>
                                <div className="text-sm font-black text-amber-600">
                                  {selectedPackageQuestions.filter(q => q.level === 'l3').length} câu
                                </div>
                              </div>
                              <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Vận dụng cao</div>
                                <div className="text-sm font-black text-rose-600">
                                  {selectedPackageQuestions.filter(q => q.level === 'l4').length} câu
                                </div>
                              </div>
                            </div>
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
                              onChange={e => setMinutes(Math.max(5, parseInt(e.target.value) || 0))} 
                              min={5} 
                              step={5}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-24 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-black text-blue-600 text-center shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <span className="text-xs font-bold text-slate-500">phút (Giáo viên tùy chỉnh)</span>
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
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" /> Phân Rã Bài Tập Bằng AI
          </h3>
          
          <div className="space-y-3">
            {breakdown.map((stepItem, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs">{stepItem.name}</div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      {stepItem.min} phút • {stepItem.lu} LU
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-blue-100">
                  {format(addDays(new Date(startDate), stepItem.dayOffset), 'dd/MM/yyyy')}
                </span>
              </div>
            ))}
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
        onConfirm={async (overrideReason) => {
          setShowWorkloadPreview(false);
          await handleConfirmSchedule(overrideReason);
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
