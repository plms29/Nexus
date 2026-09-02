'use client';
import { useTranslate, useDateLocale, useLanguage } from '@/lib/i18n';
import React, { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { TaskType, WorkmapEntry } from '@/lib/engine/types';
import { format, addDays, parseISO } from 'date-fns';
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
import { MAX_LU_PER_DAY, MAX_LU_PER_WEEK, calculateLU } from '@/lib/engine/calculator';
import { checkWeeklyQuota } from '@/lib/engine/detector';
import { getSubjectGroup } from '@/lib/engine/subject-group';
import { getClassOrientation, normalizeClassId } from '@/lib/class-utils';
import { checkLateAssignment, LATE_ASSIGNMENT_HOUR } from '@/lib/engine/late-assignment';
import { getTaskTypeLabel, isDecomposableType } from '@/lib/engine/task-templates';
import { planStepDates, buildExistingMinutesByDate } from '@/lib/engine/step-scheduler';

interface BreakdownStep {
  name: string;
  lu: number;
  min: number;
  dayOffset: number;
  /** Ngày đã chốt cho bước này, do AI xếp hoặc giáo viên chỉnh tay */
  date?: string;
}

interface WorkloadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    overrideReason?: string,
    severity?: 'critical' | 'soft',
    excessMinutes?: number
  ) => void;
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
  const tr = useTranslate();
  const dateLocale = useDateLocale();
  const lang = useLanguage(s => s.lang);
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
    const existingByDate: Record<string, { totalLU: number; totalMin: number; items: { subject: string; title: string; lu: number; min: number }[] }> = {};
    
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
          subject: tr(formatSubjectName(t?.subject_id)),
          title: tr(t?.title || e.step_name || 'Bài tập khác'),
          lu: e.lu,
          min: Number(e.minutes) || Math.round(e.lu * 30)
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
      existingItems: { subject: string; title: string; lu: number; min: number }[];
    }> = {};

    if (breakdownSteps && breakdownSteps.length > 0) {
      // Bám đúng ngày đã chốt cho từng bước (AI xếp hoặc giáo viên chỉnh tay),
      // chỉ xếp lại những bước chưa có ngày hợp lệ. Không dồn tất cả vào ngày đầu.
      const plannedDates = planStepDates(
        breakdownSteps,
        dates,
        buildExistingMinutesByDate(
          workmap,
          tasks,
          (t) => !t || normalizeClassId(t.class_id) === normalizeClassId(taskData.classId)
        )
      );

      breakdownSteps.forEach((step, i) => {
        const d = plannedDates[i] || dates[dates.length - 1];
        const currentData = existingByDate[d] || { totalLU: 0, totalMin: 0, items: [] };
        const dateObj = parseISO(d);

        if (!dateMap[d]) {
          dateMap[d] = {
            dateStr: d,
            formattedDate: format(dateObj, 'dd/MM/yyyy'),
            dayOfWeek: format(dateObj, 'EEEE', { locale: dateLocale }),
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
      });
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
        dayOfWeek: format(dateObj, 'EEEE', { locale: dateLocale }),
        newSteps: [{
          name: taskData.title,
          min: taskData.minutes,
          lu: taskData.minutes / 30
        }],
        existingLU: ex.totalLU,
        existingItems: ex.items
      };
    }

    return Object.values(dateMap).sort((a, b) => a.dateStr.localeCompare(b.dateStr)).map(day => {
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

  // Tỷ lệ 70/30 giữa hai ban, tính trên tổng LU của tuần chứa các ngày được xếp lịch
  const weeklyQuota = useMemo(() => {
    if (!isOpen || previewSchedule.length === 0) return null;

    const anchor = parseISO(previewSchedule[0].dateStr);
    // Lùi về thứ Hai của tuần chứa ngày đầu tiên (getDay: 0 là Chủ nhật)
    const monday = addDays(anchor, anchor.getDay() === 0 ? -6 : 1 - anchor.getDay());
    const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), 'yyyy-MM-dd'));

    const classId = normalizeClassId(taskData.classId);
    const existingEntries: WorkmapEntry[] = workmap.filter(e => {
      const t = tasks.find(tk => tk.id === e.task_id);
      return t ? normalizeClassId(t.class_id) === classId : false;
    });

    const subjectGroup = getSubjectGroup(taskData.subjectId);
    const newEntries: WorkmapEntry[] = previewSchedule.flatMap(day =>
      day.newSteps.map(step => ({
        date: day.dateStr,
        subject_group: subjectGroup,
        minutes: step.min,
        lu: step.lu,
        task_id: 'preview',
        step_name: step.name,
      }))
    );

    return {
      ...checkWeeklyQuota(weekDates, existingEntries, newEntries, getClassOrientation(classId), lang),
      orientation: getClassOrientation(classId),
      subjectGroup,
    };
  }, [isOpen, previewSchedule, workmap, tasks, taskData.classId, taskData.subjectId, lang]);

  // Luật giao bài sau 19:00: hôm đó không còn là ngày làm bài hợp lệ
  const lateCheck = useMemo(
    () => (isOpen ? checkLateAssignment(taskData.startDate, taskData.deadline, new Date(), lang) : null),
    [isOpen, taskData.startDate, taskData.deadline, lang]
  );

  // Vượt quỹ LU tuần của một nhóm môn (70/30) cũng là vi phạm phải trình bày với nhà trường
  const exceedsGroupQuota = !!weeklyQuota?.requiresOverride;

  // Phải nhập lý do khi quá tải ngày, vượt quỹ nhóm môn tuần,
  // hoặc khi giao gấp sau 19:00 mà không còn ngày làm bài
  const requiresOverride = hasAnyCritical || exceedsGroupQuota || !!lateCheck?.isDeadlineTooTight;

  // Số phút vượt ngưỡng 5 LU/ngày ở ngày nặng nhất, dùng để phân mức nghiêm trọng trong audit log
  const excessMinutes = Math.max(0, Math.round(maxDayLU * 30 - MAX_LU_PER_DAY * 30));
  // Theo tài liệu: vượt trên 30 phút thì phải trình bày lý do cho nhà trường
  const overrideSeverity: 'critical' | 'soft' =
    excessMinutes > 30 || exceedsGroupQuota || lateCheck?.isDeadlineTooTight ? 'critical' : 'soft';

  const isDecomposable = isDecomposableType(taskData.type);
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
                      {tr("Xem trước Workmap")}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {tr("Lớp")} {taskData.classId}
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 mt-0.5">
                    {tr("Mô Phỏng Chia Workload Lên Workmap")}
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
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr("Tên bài tập")}</div>
                <div className="font-extrabold text-slate-900 truncate mt-0.5" title={tr(taskData.title)}>
                  {tr(taskData.title)}
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr("Bộ môn & Dạng")}</div>
                <div className="font-extrabold text-slate-900 truncate mt-0.5">
                  {tr("Môn")} {tr(formatSubjectName(taskData.subjectId))} • {tr(getTaskTypeLabel(taskData.type))}
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr("Tổng thời lượng")}</div>
                <div className="font-black text-blue-600 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {totalNewMinutes} {tr("phút (")}{calculateLU(totalNewMinutes)} LU)
                </div>
              </div>

              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3 shadow-2xs">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr("Hình thức")}</div>
                <div className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                  {taskData.isGroup ? <Users className="w-3.5 h-3.5 text-indigo-600" /> : <User className="w-3.5 h-3.5 text-emerald-600" />}
                  {taskData.isGroup ? tr("Làm nhóm") : tr("Cá nhân")}
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
                    ? tr("Cảnh Báo Quá Tải Workmap Cho Lớp Học!") 
                    : maxDayLU > 3.5 
                    ? tr("Workload Khá Cao - Cần Lưu Ý Hạn Nộp") 
                    : tr("Phân Bổ Workload Rất Cân Bằng & Tối Ưu!")}
                </h4>
                <p className="font-semibold text-slate-600 leading-relaxed">
                  {hasAnyCritical 
                    ? tr("Phân bổ bài tập này sẽ làm tổng tải học tập vượt ngưỡng 5.0 LU (150 phút/ngày) vào một số ngày. Vui lòng chọn giải pháp bên dưới.")
                    : maxDayLU > 3.5 
                    ? tr("Tải học tập đạt xấp xỉ 3.5 - 5.0 LU/ngày. Học sinh sẽ cần tập trung nhưng vẫn nằm trong phạm vi cho phép.")
                    : tr("Bài tập được xếp đều vào các ngày có tải nhẹ, giúp học sinh duy trì sức bền và học tập hiệu quả.")}
                </p>
              </div>
            </div>

            {/* Cảnh báo giao bài sau 19:00 */}
            {lateCheck && lateCheck.isLate && (
              <div className={clsx(
                "rounded-2xl p-4 border shadow-sm flex items-start gap-3.5",
                lateCheck.isDeadlineTooTight
                  ? "bg-rose-50 border-rose-200"
                  : "bg-amber-50 border-amber-200"
              )}>
                <div className={clsx(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white",
                  lateCheck.isDeadlineTooTight ? "bg-rose-600" : "bg-amber-600"
                )}>
                  <Clock className="w-5 h-5" />
                </div>

                <div className="space-y-1.5 text-xs flex-1">
                  <h4 className={clsx(
                    "font-black text-sm tracking-tight",
                    lateCheck.isDeadlineTooTight ? "text-rose-950" : "text-amber-950"
                  )}>
                    {lateCheck.isDeadlineTooTight
                      ? `${tr("Giao Bài Quá Gấp Sau")} ${LATE_ASSIGNMENT_HOUR}:00!`
                      : tr(`Giao Bài Sau ${LATE_ASSIGNMENT_HOUR}:00 - Lịch Bắt Đầu Từ Ngày Mai`)}
                  </h4>
                  <p className="font-semibold text-slate-600 leading-relaxed">
                    {lateCheck.reason}
                  </p>

                  {lateCheck.isDeadlineTooTight && onUpdateDeadline && (
                    <button
                      type="button"
                      onClick={() => onUpdateDeadline(lateCheck.suggestedDeadline)}
                      className="mt-1 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {tr("Dời hạn nộp sang")} {lateCheck.suggestedDeadline}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cân đối tỷ lệ 70/30 giữa hai ban trong tuần */}
            {weeklyQuota && weeklyQuota.totalLU > 0 && (
              <div className={clsx(
                "rounded-2xl p-4 border shadow-sm space-y-3",
                weeklyQuota.status === 'quota_exceeded'
                  ? "bg-rose-50/70 border-rose-200"
                  : weeklyQuota.status === 'ratio_deviation'
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-white border-slate-200/90"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      {tr("Cân Đối Tỷ Lệ Tự Nhiên / Xã Hội Trong Tuần")}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {tr("Lớp")} {taskData.classId} {tr("thuộc ban")}{' '}
                      <strong className="text-slate-700">
                        {weeklyQuota.orientation === 'natural' ? tr("tự nhiên") : tr("xã hội")}
                      </strong>
                      {' '}{tr("— quỹ tuần")} {weeklyQuota.primaryQuotaLU.toFixed(1)} {tr("LU cho nhóm môn chính,")}{' '}
                      {weeklyQuota.secondaryQuotaLU.toFixed(1)} {tr("LU cho nhóm còn lại.")}
                    </p>
                  </div>
                  <span className={clsx(
                    "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0",
                    weeklyQuota.status === 'quota_exceeded'
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : weeklyQuota.status === 'ratio_deviation'
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : weeklyQuota.status === 'balanced'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {weeklyQuota.status === 'quota_exceeded'
                      ? tr("Vượt quỹ nhóm môn")
                      : weeklyQuota.status === 'ratio_deviation'
                        ? tr("Lệch tỷ lệ")
                        : weeklyQuota.status === 'balanced'
                          ? tr("Cân đối")
                          : tr("Tuần còn nhẹ")}
                  </span>
                </div>

                {/* Thanh tỷ lệ hai nhóm môn */}
                <div className="space-y-1.5">
                  <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${weeklyQuota.ratioNatural * 100}%` }}
                    />
                    <div
                      className="bg-purple-500 h-full transition-all duration-500"
                      style={{ width: `${weeklyQuota.ratioSocial * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span className="text-blue-700">
                      {tr("Tự nhiên")} {Math.round(weeklyQuota.ratioNatural * 100)}% ({weeklyQuota.naturalLU.toFixed(1)} LU)
                    </span>
                    <span className="text-slate-500">
                      {tr("Tổng tuần")} {weeklyQuota.totalLU.toFixed(1)} / {MAX_LU_PER_WEEK} LU
                    </span>
                    <span className="text-purple-700">
                      {tr("Xã hội")} {Math.round(weeklyQuota.ratioSocial * 100)}% ({weeklyQuota.socialLU.toFixed(1)} LU)
                    </span>
                  </div>
                </div>

                {/* Mức tiêu thụ tuyệt đối so với quỹ LU tuần của từng nhóm môn */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  {([
                    {
                      label: tr(weeklyQuota.orientation === 'natural' ? 'Tự nhiên (nhóm chính)' : 'Xã hội (nhóm chính)'),
                      used: weeklyQuota.primaryLU,
                      quota: weeklyQuota.primaryQuotaLU,
                    },
                    {
                      label: tr(weeklyQuota.orientation === 'natural' ? 'Xã hội (nhóm phụ)' : 'Tự nhiên (nhóm phụ)'),
                      used: weeklyQuota.secondaryLU,
                      quota: weeklyQuota.secondaryQuotaLU,
                    },
                  ]).map((g) => {
                    const over = g.used > g.quota;
                    return (
                      <div
                        key={g.label}
                        className={clsx(
                          "rounded-xl border px-3 py-2 space-y-1",
                          over ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">{g.label}</span>
                          <span className={over ? "text-rose-700" : "text-slate-700"}>
                            {g.used.toFixed(1)} / {g.quota.toFixed(1)} LU
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={clsx("h-full rounded-full transition-all duration-500", over ? "bg-rose-500" : "bg-emerald-500")}
                            style={{ width: `${Math.min(100, (g.used / g.quota) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {weeklyQuota.reason && (
                  <div className={clsx(
                    "flex items-start gap-2 text-[11px] font-semibold rounded-xl p-2.5 border",
                    weeklyQuota.status === 'quota_exceeded'
                      ? "text-rose-900 bg-rose-100/70 border-rose-200"
                      : weeklyQuota.status === 'ratio_deviation'
                        ? "text-amber-900 bg-amber-100/70 border-amber-200"
                        : "text-slate-600 bg-slate-50 border-slate-200"
                  )}>
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      {weeklyQuota.reason}
                      {weeklyQuota.status === 'quota_exceeded' && (
                        <strong className="block mt-1 text-rose-900">
                          {tr("Vẫn giao được nhưng bắt buộc ghi lý do ghi đè và lưu audit log gửi nhà trường.")}
                        </strong>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

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
                        {tr("Quy Trình Xử Lý Quá Tải Workmap (ExamLoad Workflow)")}
                      </h4>
                      <span className="text-[11px] font-semibold text-rose-700/80">
                        {isDecomposable 
                          ? tr("Dạng bài chia nhỏ (Decomposable): Đã tự động phân rải các bước qua các ngày thấp tải.")
                          : tr("Dạng bài nguyên khối (Atomic): Bạn nên dời hạn nộp hoặc chuyển sang làm nhóm.")}
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
                            {tr("1. Dời Hạn Nộp Sang Ngày Tải Nhẹ")}
                          </span>
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                            {tr("Khuyên dùng")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {tr("Tự động gia hạn nộp đến")} <strong className="text-blue-900 font-extrabold">{suggestedNewDeadlineObj.formatted}</strong> {tr("để hạ mức tải học sinh về an toàn.")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUpdateDeadline(suggestedNewDeadlineObj.isoStr)}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {tr("Đổi Hạn Nộp Sang")} {suggestedNewDeadlineObj.formatted}
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
                            {tr("2. Chuyển Hình Thức Làm Nhóm")}
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {tr("Giảm 50% LU")}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {tr("Chuyển sang nhóm 3-4 học sinh giúp chia sẻ công việc, giảm 50% thời lượng cần thiết của từng em.")}
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
                        {taskData.isGroup ? tr("✓ Đã Bật Làm Nhóm (Đã giảm 50% LU)") : tr("Chuyển Sang Làm Nhóm (Giảm 50% LU)")}
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
                  {tr("Kế Hoạch Xếp Lịch Chi Tiết Trên Workmap")}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {tr("Chuẩn quy đổi:")} <strong className="text-blue-600 font-extrabold">{tr("1 LU = 30 phút")}</strong> {tr("(Tối đa 5.0 LU/ngày)")}
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
                            {tr("Tải công việc trong ngày:")} <strong className="text-slate-800 font-extrabold">{item.totalLUAfter.toFixed(1)} LU ({Math.round(item.totalLUAfter * 30)} {tr("phút)")}</strong>
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
                          {item.statusLevel === 'critical' ? tr("🔴 Quá tải (>5.0 LU)") : item.statusLevel === 'warning' ? tr("🟡 Tải cao (3.5-5.0 LU)") : tr("🟢 Workload An toàn")}
                        </span>
                      </div>
                    </div>

                    {/* Stacked Tasks Container */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
                        <span>{tr("Danh Sách Bài Tập Xếp Chồng Trong Ngày (")}{item.existingItems.length + 1} task):</span>
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
                              <span className="font-extrabold text-slate-800">{tr(exItem.title)}</span>
                              <span className="text-[11px] text-slate-400 font-medium italic ml-1.5">{tr("(Bài tập đã có)")}</span>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs">
                            {exItem.lu.toFixed(1)} LU ({exItem.min}m)
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
                              {tr("Mới")}
                            </div>
                            <div className="truncate">
                              <span className="font-extrabold text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded-md mr-2 text-[11px] shadow-2xs">
                                {tr("📌 Môn")} {tr(formatSubjectName(taskData.subjectId))} {tr("(Đang giao)")}
                              </span>
                              <span className="font-black text-blue-950">{tr(step.name)}</span>
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
                          {tr("Tổng tải Workmap sau khi xếp chồng:")}
                        </span>
                        <span className={clsx(
                          item.totalLUAfter > 5.0 ? "text-rose-600" : item.totalLUAfter > 3.5 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {item.totalLUAfter.toFixed(1)} LU / 5.0 LU ({Math.round(item.totalLUAfter * 30)} {tr("phút)")}
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
              {tr("Quay Lại Điều Chỉnh")}
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {requiresOverride && (
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  {tr("Ghi Đè & Lưu Audit Log")}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (requiresOverride) {
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
                {requiresOverride ? tr("Bắt Buộc Giao Bài (Cần Ghi Đè)") : tr("Xác Nhận & Chính Thức Giao Bài")}
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
                    {tr("Ghi Đè Cảnh Báo & Lưu Audit Log")}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {hasAnyCritical
                      ? tr("Xác nhận giao bài dù tải công việc vượt 5.0 LU/ngày.")
                      : lateCheck?.isDeadlineTooTight
                        ? `Xác nhận giao bài dù đã quá ${LATE_ASSIGNMENT_HOUR}:00 và học sinh không còn ngày trọn vẹn để làm.`
                        : exceedsGroupQuota
                          ? `Xác nhận giao bài dù nhóm môn ${weeklyQuota?.overloadedGroup === 'natural' ? tr("tự nhiên") : tr("xã hội")} đã dùng vượt quỹ LU tuần theo tỷ lệ 70/30.`
                          : tr("Xác nhận giao bài dù có cảnh báo từ hệ thống.")}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-extrabold text-slate-700 block">
                  {tr("Vui lòng chọn hoặc nhập lý do ghi đè (Lưu nhật ký hệ thống):")}
                </label>
                {[
                  ...(lateCheck?.isDeadlineTooTight
                    ? [`Giao gấp sau ${LATE_ASSIGNMENT_HOUR}:00 do yêu cầu đột xuất của nhà trường`]
                    : []),
                  ...(exceedsGroupQuota
                    ? [`Vượt quỹ LU tuần của nhóm môn ${weeklyQuota?.overloadedGroup === 'natural' ? tr("tự nhiên") : tr("xã hội")} do lịch kiểm tra tập trung của tổ bộ môn`]
                    : []),
                  tr("Bài kiểm tra trọng tâm bắt buộc theo kế hoạch bộ môn"),
                  tr("Lớp học đã được chuẩn bị bài trước từ tuần trước"),
                  tr("Đã thỏa thuận và thống nhất khối lượng làm việc với học sinh"),
                  tr("Khác (nhập chi tiết bên dưới)")
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
                    placeholder={tr("Nhập lý do ghi đè chi tiết...")}
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
                  {tr("Hủy Bỏ")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const chosenReason = selectedReasonOption.includes('Khác')
                      ? (customReasonText || 'Ghi đè cảnh báo quá tải')
                      : selectedReasonOption;
                    // Ghép thêm mô tả vi phạm quỹ tuần để nhà trường đọc audit log
                    // biết chính xác đã vượt cái gì, không chỉ có lý do của giáo viên
                    const finalReason = exceedsGroupQuota && weeklyQuota?.reason
                      ? `${chosenReason} — ${weeklyQuota.reason}`
                      : chosenReason;
                    setShowOverrideModal(false);
                    onConfirm(finalReason, overrideSeverity, excessMinutes);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  {tr("Xác Nhận Ghi Đè & Giao Bài")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
