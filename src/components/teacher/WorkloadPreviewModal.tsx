'use client';
import React, { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { TaskType, WorkmapEntry } from '@/lib/engine/types';
import { format, addDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  BookOpen, 
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  Users,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { MAX_LU_PER_DAY } from '@/lib/engine/calculator';

interface BreakdownStep {
  name: string;
  lu: number;
  min: number;
  dayOffset: number;
}

interface WorkloadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (overrideReason?: string) => void;
  taskData: {
    title: string;
    type: TaskType;
    classId: string;
    subjectId: string;
    startDate: string;
    deadline: string;
    minutes: number;
    isGroup: boolean;
  };
  breakdownSteps?: BreakdownStep[] | null;
  onUpdateDeadline?: (newDeadline: string) => void;
  onUpdateIsGroup?: (isGroup: boolean) => void;
}

const getTaskTypeLabel = (type: TaskType) => {
  switch (type) {
    case 'quiz': return 'Trắc nghiệm (Nguyên khối)';
    case 'chart': return 'Biểu đồ (Chia nhỏ)';
    case 'essay': return 'Bài Luận (Chia nhỏ)';
    case 'project': return 'Dự án (Chia nhỏ)';
    default: return type;
  }
};

const formatSubjectName = (subId?: string) => {
  if (!subId) return 'Môn học';
  const s = subId.toLowerCase();
  if (s.includes('toan')) return 'Toán học';
  if (s.includes('tin')) return 'Tin học';
  if (s.includes('ly') || s.includes('vật')) return 'Vật lý';
  if (s.includes('hoa') || s.includes('hóa')) return 'Hóa học';
  if (s.includes('van') || s.includes('văn')) return 'Ngữ văn';
  if (s.includes('anh')) return 'Tiếng Anh';
  if (s.includes('su') || s.includes('sử')) return 'Lịch sử';
  if (s.includes('dia') || s.includes('địa')) return 'Địa lý';
  if (s.includes('sinh')) return 'Sinh học';
  return subId;
};

export const WorkloadPreviewModal: React.FC<WorkloadPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskData,
  breakdownSteps,
  onUpdateDeadline,
  onUpdateIsGroup
}) => {
  const { workmap, tasks } = useStore();

  // Override Audit Log Modal State
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [selectedReasonOption, setSelectedReasonOption] = useState<string>(
    'Bài kiểm tra trọng tâm bắt buộc theo kế hoạch bộ môn'
  );
  const [customReasonText, setCustomReasonText] = useState<string>('');

  // Compute workload schedule preview
  const previewSchedule = useMemo(() => {
    if (!isOpen) return [];

    const dates: string[] = [];
    let curr = new Date(taskData.startDate);
    const end = new Date(taskData.deadline);
    
    // Safety guard for date loop
    let count = 0;
    while (curr <= end && count < 60) {
      dates.push(format(curr, 'yyyy-MM-dd'));
      curr = addDays(curr, 1);
      count++;
    }
    if (dates.length === 0) dates.push(taskData.startDate);

    // Map existing workmap entries for class
    const existingByDate: Record<string, { totalLU: number; totalMin: number; items: { subject: string; title: string; lu: number }[] }> = {};
    
    dates.forEach(d => {
      const classEntries = workmap.filter(e => {
        if (e.date !== d) return false;
        const t = tasks.find(tk => tk.id === e.task_id);
        return !t || t.class_id === taskData.classId;
      });

      const totalMin = classEntries.reduce((sum, e) => sum + e.minutes, 0);
      const totalLU = totalMin / 30;

      const items = classEntries.map(e => {
        const t = tasks.find(tk => tk.id === e.task_id);
        return {
          subject: formatSubjectName(t?.subject_id),
          title: t?.title || e.step_name || 'Bài tập khác',
          lu: e.lu
        };
      });

      existingByDate[d] = { totalLU, totalMin, items };
    });

    const dateMap: Record<string, {
      dateStr: string;
      formattedDate: string;
      dayOfWeek: string;
      newSteps: { name: string; min: number; lu: number }[];
      existingLU: number;
      existingItems: { subject: string; title: string; lu: number }[];
    }> = {};

    if (breakdownSteps && breakdownSteps.length > 0) {
      // Decomposable simulation
      let stepIdx = 0;
      for (const d of dates) {
        if (stepIdx >= breakdownSteps.length) break;
        const currentData = existingByDate[d] || { totalLU: 0, totalMin: 0, items: [] };
        let availableMinutes = 150 - currentData.totalLU * 30;

        while (stepIdx < breakdownSteps.length && availableMinutes >= breakdownSteps[stepIdx].min) {
          const step = breakdownSteps[stepIdx];
          const dateObj = parseISO(d);

          if (!dateMap[d]) {
            dateMap[d] = {
              dateStr: d,
              formattedDate: format(dateObj, 'dd/MM/yyyy'),
              dayOfWeek: format(dateObj, 'EEEE', { locale: vi }),
              newSteps: [],
              existingLU: currentData.totalLU,
              existingItems: currentData.items
            };
          }

          dateMap[d].newSteps.push({
            name: step.name,
            min: step.min,
            lu: step.lu
          });

          currentData.totalLU += step.lu;
          availableMinutes -= step.min;
          stepIdx++;
        }
      }

      // If leftover steps couldn't fit in non-overloaded days, push to deadline
      while (stepIdx < breakdownSteps.length) {
        const step = breakdownSteps[stepIdx];
        const lastDate = dates[dates.length - 1];
        const currentData = existingByDate[lastDate] || { totalLU: 0, totalMin: 0, items: [] };
        const dateObj = parseISO(lastDate);

        if (!dateMap[lastDate]) {
          dateMap[lastDate] = {
            dateStr: lastDate,
            formattedDate: format(dateObj, 'dd/MM/yyyy'),
            dayOfWeek: format(dateObj, 'EEEE', { locale: vi }),
            newSteps: [],
            existingLU: currentData.totalLU,
            existingItems: currentData.items
          };
        }

        dateMap[lastDate].newSteps.push({
          name: step.name,
          min: step.min,
          lu: step.lu
        });

        currentData.totalLU += step.lu;
        stepIdx++;
      }
    } else {
      // Non-decomposable simulation: find best date in range
      let scheduledDate = dates[0];
      for (const d of dates) {
        const ex = existingByDate[d] || { totalLU: 0, totalMin: 0, items: [] };
        if (ex.totalLU * 30 + taskData.minutes <= 150) {
          scheduledDate = d;
          break;
        }
      }

      const ex = existingByDate[scheduledDate] || { totalLU: 0, totalMin: 0, items: [] };
      const dateObj = parseISO(scheduledDate);

      dateMap[scheduledDate] = {
        dateStr: scheduledDate,
        formattedDate: format(dateObj, 'dd/MM/yyyy'),
        dayOfWeek: format(dateObj, 'EEEE', { locale: vi }),
        newSteps: [{
          name: taskData.title,
          min: taskData.minutes,
          lu: taskData.minutes / 30
        }],
        existingLU: ex.totalLU,
        existingItems: ex.items
      };
    }

    return Object.values(dateMap).map(day => {
      const totalNewLU = day.newSteps.reduce((acc, s) => acc + s.lu, 0);
      const totalNewMin = day.newSteps.reduce((acc, s) => acc + s.min, 0);
      const totalLUAfter = day.existingLU + totalNewLU;
      let statusLevel: 'safe' | 'warning' | 'critical' = 'safe';
      if (totalLUAfter > 5.0) statusLevel = 'critical';
      else if (totalLUAfter > 3.5) statusLevel = 'warning';

      return {
        ...day,
        totalNewLU,
        totalNewMin,
        totalLUAfter,
        isOverloaded: totalLUAfter > 5.0,
        statusLevel
      };
    });
  }, [isOpen, taskData, breakdownSteps, workmap, tasks]);

  const totalNewMinutes = (breakdownSteps && breakdownSteps.length > 0)
    ? breakdownSteps.reduce((acc, s) => acc + s.min, 0)
    : taskData.minutes;
  const totalNewLU = totalNewMinutes / 30;
  const hasAnyCritical = previewSchedule.some(s => s.isOverloaded);
  const maxDayLU = Math.max(0, ...previewSchedule.map(s => s.totalLUAfter));

  const isDecomposable = taskData.type !== 'quiz';
  const suggestedNewDeadlineObj = useMemo(() => {
    if (!taskData.deadline) return null;
    try {
      const currDate = parseISO(taskData.deadline);
      const extended = addDays(currDate, 2);
      return {
        isoStr: format(extended, 'yyyy-MM-dd'),
        formatted: format(extended, 'dd/MM/yyyy')
      };
    } catch (e) {
      return null;
    }
  }, [taskData.deadline]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header (shrink-0 ensures no text cutoff at top) */}
          <div className="bg-white border-b border-slate-200/80 p-6 relative overflow-hidden shrink-0">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      Xem trước Workmap
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Lớp {taskData.classId}
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                    Mô Phỏng Chia Workload Lên Workmap
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task Meta Brief */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100 text-xs">
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tên bài tập</div>
                <div className="font-extrabold text-slate-900 truncate mt-0.5" title={taskData.title}>
                  {taskData.title}
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bộ môn & Dạng</div>
                <div className="font-extrabold text-slate-900 truncate mt-0.5">
                  Môn {formatSubjectName(taskData.subjectId)} • {taskData.type === 'quiz' ? 'Trắc nghiệm' : taskData.type === 'essay' ? 'Tự luận' : taskData.type === 'project' ? 'Dự án' : 'Biểu đồ'}
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tổng thời lượng</div>
                <div className="font-black text-blue-600 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {totalNewMinutes} phút ({totalNewLU.toFixed(1)} LU)
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Hình thức</div>
                <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                  {taskData.isGroup ? <Users className="w-3.5 h-3.5 text-indigo-600" /> : <User className="w-3.5 h-3.5 text-emerald-600" />}
                  {taskData.isGroup ? 'Làm nhóm' : 'Cá nhân'}
                </div>
              </div>
            </div>
          </div>

          {/* Body Content - Scrollable */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
            {/* Status Summary Banner */}
            <div className={clsx(
              "p-4 rounded-2xl border flex items-start gap-3.5 shadow-sm transition-all",
              hasAnyCritical 
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : maxDayLU > 3.5 
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            )}>
              <div className={clsx(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white font-bold",
                hasAnyCritical ? "bg-rose-600" : maxDayLU > 3.5 ? "bg-amber-600" : "bg-emerald-600"
              )}>
                {hasAnyCritical ? <ShieldAlert className="w-5 h-5" /> : maxDayLU > 3.5 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>

              <div className="space-y-0.5 text-xs">
                <h4 className="font-black text-sm tracking-tight">
                  {hasAnyCritical 
                    ? "Cảnh Báo Quá Tải Workmap Cho Lớp Học!" 
                    : maxDayLU > 3.5 
                    ? "Workload Khá Cao - Cần Lưu Ý Hạn Nộp" 
                    : "Phân Bổ Workload Rất Cân Bằng & Tối Ưu!"}
                </h4>
                <p className="font-semibold text-slate-600 leading-relaxed">
                  {hasAnyCritical 
                    ? "Phân bổ bài tập này sẽ làm tổng tải học tập vượt ngưỡng 5.0 LU (150 phút/ngày) vào một số ngày. Vui lòng chọn giải pháp bên dưới."
                    : maxDayLU > 3.5 
                    ? "Tải học tập đạt xấp xỉ 3.5 - 5.0 LU/ngày. Học sinh sẽ cần tập trung nhưng vẫn nằm trong phạm vi cho phép."
                    : "Bài tập được xếp đều vào các ngày có tải nhẹ, giúp học sinh duy trì sức bền và học tập hiệu quả."}
                </p>
              </div>
            </div>

            {/* ExamLoad Overload Processing Workflow Solutions Panel */}
            {hasAnyCritical && (
              <div className="bg-gradient-to-br from-rose-50/90 via-amber-50/40 to-white rounded-3xl p-5 border border-rose-200/90 shadow-sm space-y-3.5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-black text-rose-950 text-sm flex items-center gap-2">
                        Quy Trình Xử Lý Quá Tải Workmap (ExamLoad Workflow)
                      </h4>
                      <span className="text-[11px] font-semibold text-rose-700/80">
                        {isDecomposable 
                          ? 'Dạng bài chia nhỏ (Decomposable): Đã tự động phân rải các bước qua các ngày thấp tải.'
                          : 'Dạng bài nguyên khối (Atomic): Bạn nên dời hạn nộp hoặc chuyển sang làm nhóm.'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Solution Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Option A: Recommend new deadline */}
                  {suggestedNewDeadlineObj && onUpdateDeadline && (
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between hover:border-blue-300 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            1. Dời Hạn Nộp Sang Ngày Tải Nhẹ
                          </span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            Khuyên dùng
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Tự động gia hạn nộp đến <strong className="text-blue-900 font-extrabold">{suggestedNewDeadlineObj.formatted}</strong> để hạ mức tải học sinh về an toàn.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateDeadline(suggestedNewDeadlineObj.isoStr)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Đổi Hạn Nộp Sang {suggestedNewDeadlineObj.formatted}
                      </button>
                    </div>
                  )}

                  {/* Option B: Group Work / Scope Reduction */}
                  {onUpdateIsGroup && (
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between hover:border-indigo-300 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                            <Users className="w-4 h-4 text-indigo-600" />
                            2. Chuyển Hình Thức Làm Nhóm
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            Giảm 50% LU
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Chuyển sang nhóm 3-4 học sinh giúp chia sẻ công việc, giảm 50% thời lượng cần thiết của từng em.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateIsGroup(!taskData.isGroup)}
                        className={clsx(
                          "w-full py-2 px-3 rounded-xl font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs border",
                          taskData.isGroup 
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" 
                            : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
                        )}
                      >
                        <Users className="w-3.5 h-3.5" />
                        {taskData.isGroup ? '✓ Đã Bật Làm Nhóm (Đã giảm 50% LU)' : 'Chuyển Sang Làm Nhóm (Giảm 50% LU)'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Workmap Allocation Timeline Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Kế Hoạch Xếp Lịch Chi Tiết Trên Workmap
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Chuẩn quy đổi: <strong className="text-blue-600 font-extrabold">1 LU = 30 phút</strong> (Tối đa 5.0 LU/ngày)
                </span>
              </div>

              {/* Day Breakdown Cards (Stacked Tasks per Day) */}
              <div className="space-y-4">
                {previewSchedule.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-all"
                  >
                    {/* Top Header: Date & Overall Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100 shrink-0 shadow-sm">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm capitalize flex items-center gap-2">
                            {item.dayOfWeek} <span className="text-slate-500 text-xs font-extrabold">({item.formattedDate})</span>
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Tải công việc trong ngày: <strong className="text-slate-800 font-extrabold">{item.totalLUAfter.toFixed(1)} LU ({Math.round(item.totalLUAfter * 30)} phút)</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={clsx(
                          "text-xs font-black px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm",
                          item.statusLevel === 'critical' ? "bg-rose-50 text-rose-700 border-rose-200" :
                          item.statusLevel === 'warning' ? "bg-amber-50 text-amber-800 border-amber-200" :
                          "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {item.statusLevel === 'critical' ? '🔴 Quá tải (>5.0 LU)' : item.statusLevel === 'warning' ? '🟡 Tải cao (3.5-5.0 LU)' : '🟢 Workload An toàn'}
                        </span>
                      </div>
                    </div>

                    {/* Stacked Tasks Container */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>Danh Sách Bài Tập Xếp Chồng Trong Ngày ({item.existingItems.length + 1} task):</span>
                      </div>

                      {/* Stacked Row 1: Existing tasks from other subjects */}
                      {item.existingItems.map((exItem, i) => (
                        <div 
                          key={i} 
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-600 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              #{i + 1}
                            </div>
                            <div className="truncate">
                              <span className="font-extrabold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md mr-2 text-[11px] shadow-2xs">
                                {exItem.subject}
                              </span>
                              <span className="font-extrabold text-slate-800">{exItem.title}</span>
                              <span className="text-[11px] text-slate-400 font-medium italic ml-1.5">(Bài tập đã có)</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                            {exItem.lu} LU ({exItem.lu * 30}m)
                          </span>
                        </div>
                      ))}

                      {/* Stacked Row 2: New Task Steps Being Assigned (Highlighted) */}
                      {item.newSteps.map((step, sIdx) => (
                        <div 
                          key={`new-${sIdx}`}
                          className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-blue-50 border border-blue-300 flex items-center justify-between gap-3 text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                              Mới
                            </div>
                            <div className="truncate">
                              <span className="font-extrabold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-md mr-2 text-[11px] shadow-2xs">
                                📌 Môn {formatSubjectName(taskData.subjectId)} (Đang giao)
                              </span>
                              <span className="font-black text-blue-950">{step.name}</span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-blue-700 bg-white border border-blue-300 px-3 py-1 rounded-xl shrink-0 shadow-sm">
                            +{step.lu.toFixed(1)} LU ({step.min}m)
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Workload Progress Meter */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-slate-600">
                          Tổng tải Workmap sau khi xếp chồng:
                        </span>
                        <span className={clsx(
                          item.totalLUAfter > 5.0 ? "text-rose-600" : item.totalLUAfter > 3.5 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {item.totalLUAfter.toFixed(1)} LU / 5.0 LU ({Math.round(item.totalLUAfter * 30)} phút)
                        </span>
                      </div>

                      {/* Meter bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                        <div 
                          className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            item.totalLUAfter > 5.0 ? "bg-gradient-to-r from-rose-500 to-red-600" :
                            item.totalLUAfter > 3.5 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                            "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          )}
                          style={{ width: `${Math.min(100, (item.totalLUAfter / 5.0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Controls (shrink-0 ensures bottom buttons stay clean) */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
            >
              Quay Lại Điều Chỉnh
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {hasAnyCritical && (
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Ghi Đè & Lưu Audit Log
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (hasAnyCritical) {
                    setShowOverrideModal(true);
                  } else {
                    onConfirm();
                  }
                }}
                className={clsx(
                  "w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer",
                  hasAnyCritical 
                    ? "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-500/20"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                {hasAnyCritical ? 'Bắt Buộc Giao Bài (Cần Ghi Đè)' : 'Xác Nhận & Chính Thức Giao Bài'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Override Audit Log Reason Modal */}
      <AnimatePresence>
        {showOverrideModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOverrideModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 font-bold shadow-2xs">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Ghi Đè Cảnh Báo & Lưu Audit Log
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Xác nhận giao bài dù tải công việc vượt 5.0 LU/ngày.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-extrabold text-slate-700 block">
                  Vui lòng chọn hoặc nhập lý do ghi đè (Lưu nhật ký hệ thống):
                </label>
                {[
                  'Bài kiểm tra trọng tâm bắt buộc theo kế hoạch bộ môn',
                  'Lớp học đã được chuẩn bị bài trước từ tuần trước',
                  'Đã thỏa thuận và thống nhất khối lượng làm việc với học sinh',
                  'Khác (nhập chi tiết bên dưới)'
                ].map((reasonText, idx) => (
                  <label 
                    key={idx} 
                    className={clsx(
                      "flex items-center gap-2.5 p-3 rounded-2xl border transition-all cursor-pointer font-bold",
                      selectedReasonOption === reasonText 
                        ? "bg-blue-50/80 border-blue-300 text-blue-900" 
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <input
                      type="radio"
                      name="overrideReason"
                      checked={selectedReasonOption === reasonText}
                      onChange={() => setSelectedReasonOption(reasonText)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{reasonText}</span>
                  </label>
                ))}

                {selectedReasonOption.includes('Khác') && (
                  <textarea
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder="Nhập lý do ghi đè chi tiết..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const finalReason = selectedReasonOption.includes('Khác') 
                      ? (customReasonText || 'Ghi đè cảnh báo quá tải') 
                      : selectedReasonOption;
                    setShowOverrideModal(false);
                    onConfirm(finalReason);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Xác Nhận Ghi Đè & Giao Bài
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
