'use client';
import { useTranslate } from '@/lib/i18n';
import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { format, addDays, isToday } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Maximize2, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter,
  Layers
} from 'lucide-react';
import { MAX_LU_PER_DAY } from '@/lib/engine/calculator';
import { WorkmapEntry } from '@/lib/engine/types';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Helpers
const getVietnameseDayName = (date: Date, compact: boolean = false) => {
  const fullNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const compactNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return compact ? compactNames[date.getDay()] : fullNames[date.getDay()];
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

const getSubjectBadgeStyle = (subName: string) => {
  const s = subName.toLowerCase();
  if (s.includes('toán')) return 'bg-blue-50 text-blue-700 border-blue-200/80';
  if (s.includes('tin')) return 'bg-purple-50 text-purple-700 border-purple-200/80';
  if (s.includes('lý') || s.includes('vật')) return 'bg-amber-50 text-amber-800 border-amber-200/80';
  if (s.includes('hóa')) return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  if (s.includes('văn')) return 'bg-rose-50 text-rose-700 border-rose-200/80';
  if (s.includes('anh')) return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
  return 'bg-slate-100 text-slate-700 border-slate-200/80';
};

interface WorkmapCalendarProps {
  classId?: string;
}

export const WorkmapCalendar: React.FC<WorkmapCalendarProps> = ({ classId }) => {
  const tr = useTranslate();
  const { workmap, tasks, selectedDate, setSelectedDate, classes } = useStore();

  // State for view mode: 3, 4, or 7 days (default 4 days for clean readable text)
  const [visibleDaysCount, setVisibleDaysCount] = useState<number>(4);
  const [startDateOffset, setStartDateOffset] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalFilterClass, setModalFilterClass] = useState<string>(classId || 'all');
  const [modalRangeDays, setModalRangeDays] = useState<number>(7);

  const isSevenDays = visibleDaysCount === 7;

  // Compute displayed start date
  const today = new Date();
  const baseDate = addDays(today, startDateOffset);

  // Days array for compact view
  const daysArray = Array.from({ length: visibleDaysCount }).map((_, i) => {
    const d = addDays(baseDate, i);
    return {
      dateObj: d,
      dateStr: format(d, 'yyyy-MM-dd')
    };
  });

  // Filter workmap entries
  const getEntriesForDate = (dateStr: string, targetClassId?: string) => {
    return workmap.filter(entry => {
      if (entry.date !== dateStr) return false;
      const task = tasks.find(t => t.id === entry.task_id);
      if (targetClassId && targetClassId !== 'all') {
        if (task && task.class_id !== targetClassId) return false;
      }
      return true;
    });
  };

  const getTaskInfo = (entry: WorkmapEntry) => {
    const task = tasks.find(t => t.id === entry.task_id);
    const subjectName = formatSubjectName(task?.subject_id);
    const taskTitle = task?.title || (entry.step_name && !entry.step_name.includes('-') ? entry.step_name : 'Bài tập');
    const stepName = entry.step_name && entry.step_name !== taskTitle ? entry.step_name : null;
    return { task, subjectName, taskTitle, stepName };
  };

  return (
    <div className="w-full">
      {/* Compact Main Workmap Widget */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 border border-white/80 bg-white/80 backdrop-blur-xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {tr("Dự Báo Workmap & Tải Học Tập")}
              </h2>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {tr("Theo dõi môn học, tiến độ và tải học tập (LU). Giới hạn tối đa")} <span className="font-extrabold text-blue-600">{tr("5.0 LU/ngày")}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
              {[3, 4, 7].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setVisibleDaysCount(count)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                    visibleDaysCount === count 
                      ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {count} {tr("Ngày")}
                </button>
              ))}
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStartDateOffset(prev => prev - visibleDaysCount)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                title={tr("Trang trước")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStartDateOffset(0)}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors border border-blue-200/60 cursor-pointer"
              >
                {tr("Hôm nay")}
              </button>
              <button
                type="button"
                onClick={() => setStartDateOffset(prev => prev + visibleDaysCount)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shadow-sm transition-all cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Expand Full Modal Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" /> {tr("Mở rộng Workmap")}
            </button>
          </div>
        </div>

        {/* Days Grid Cards Container */}
        <div className="overflow-x-auto custom-scrollbar pb-2 relative z-10">
          <div 
            className={clsx(
              "grid gap-3 min-w-full",
              visibleDaysCount === 3 && "grid-cols-1 md:grid-cols-3",
              visibleDaysCount === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
              visibleDaysCount === 7 && "grid-cols-7 min-w-[760px]"
            )}
          >
            {daysArray.map(({ dateObj, dateStr }) => {
              const entries = getEntriesForDate(dateStr, classId);
              const totalLU = entries.reduce((sum, e) => sum + e.lu, 0);
              const isOverloaded = totalLU > MAX_LU_PER_DAY;
              const isSelected = selectedDate === dateStr;
              const dayNameVN = getVietnameseDayName(dateObj, isSevenDays);
              const isCurrentToday = isToday(dateObj);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={clsx(
                    "rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer border overflow-hidden relative group w-full min-w-0",
                    isSevenDays ? "p-2.5" : "p-4",
                    isSelected
                      ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/30 shadow-lg scale-[1.01]"
                      : "bg-white/90 border-slate-200/90 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5",
                    isOverloaded && !isSelected && "border-rose-300 bg-rose-50/30"
                  )}
                >
                  <div className="w-full min-w-0">
                    {/* Card Header: Day Name & Date */}
                    <div className="flex items-center justify-between gap-1 mb-2 pb-2 border-b border-slate-100 w-full min-w-0">
                      <div className="min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className={clsx("font-black text-slate-900 truncate", isSevenDays ? "text-xs" : "text-base")}>
                            {dayNameVN}
                          </span>
                          {isCurrentToday && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white shrink-0">
                              {tr("Hôm nay")}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-extrabold text-slate-400 truncate">
                          {format(dateObj, isSevenDays ? 'dd/MM' : 'dd/MM/yyyy')}
                        </div>
                      </div>

                      {/* Compact Status Indicator */}
                      <div
                        className={clsx(
                          "px-1.5 py-0.5 rounded-lg text-[10px] font-black border shrink-0 truncate max-w-[45%]",
                          isOverloaded
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : totalLU > 3.5
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        )}
                        title={isOverloaded ? tr("Quá tải") : totalLU > 3.5 ? tr("Vừa phải") : tr("An toàn")}
                      >
                        {isSevenDays ? (
                          isOverloaded ? tr("Quá tải") : totalLU > 3.5 ? tr("Vừa") : tr("An toàn")
                        ) : (
                          isOverloaded ? tr("Quá tải") : totalLU > 3.5 ? tr("Vừa phải") : tr("An toàn")
                        )}
                      </div>
                    </div>

                    {/* LU Counter & Progress Bar */}
                    <div className={clsx("mb-3 bg-slate-50/90 rounded-xl border border-slate-100 w-full min-w-0", isSevenDays ? "p-2" : "p-3")}>
                      <div className="flex items-baseline justify-between mb-1 min-w-0">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate">{tr("Tải:")}</span>
                        <span className={clsx(
                          "font-black font-sans tracking-tight shrink-0",
                          isSevenDays ? "text-sm" : "text-xl",
                          isOverloaded ? "text-rose-600" : "text-blue-600"
                        )}>
                          {totalLU.toFixed(1)} <span className="text-[9px] font-bold text-slate-400 uppercase">LU</span>
                        </span>
                      </div>
                      {/* Visual LU Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full transition-all duration-500",
                            isOverloaded ? "bg-rose-500" : totalLU > 3.5 ? "bg-amber-500" : "bg-blue-600"
                          )}
                          style={{ width: `${Math.min(100, (totalLU / 5.0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks List (100% Overflow-Safe Stacked Layout) */}
                    <div className="space-y-1.5 min-h-[85px] w-full min-w-0">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 truncate">
                        <span>{tr("Môn & Bài (")}{entries.length})</span>
                      </div>

                      {entries.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50/50 p-2 rounded-xl text-center border border-dashed border-slate-200 truncate">
                          {tr("Không có bài tập")}
                        </div>
                      ) : (
                        entries.map((entry, idx) => {
                          const { subjectName, taskTitle, stepName } = getTaskInfo(entry);
                          const badgeStyle = getSubjectBadgeStyle(subjectName);

                          return (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-1 w-full min-w-0 overflow-hidden"
                            >
                              {/* Row 1: Subject Badge & LU */}
                              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                                <span className={clsx("px-1.5 py-0.5 rounded-md text-[10px] font-extrabold border truncate max-w-[65%]", badgeStyle)}>
                                  {subjectName}
                                </span>
                                <span className="text-[10px] font-extrabold text-slate-500 shrink-0">
                                  {entry.lu.toFixed(1)} LU
                                </span>
                              </div>
                              
                              {/* Row 2: Task Title (Truncated) */}
                              <div 
                                className="text-[11px] font-extrabold text-slate-900 leading-tight truncate w-full"
                                title={taskTitle}
                              >
                                {taskTitle}
                              </div>

                              {/* Row 3: Step Name if available */}
                              {stepName && (
                                <div 
                                  className="text-[9px] font-extrabold text-blue-600 bg-blue-50/80 px-1.5 py-0.5 rounded truncate w-full"
                                  title={stepName}
                                >
                                  {tr("Bước:")} {stepName}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(dateStr);
                      setIsModalOpen(true);
                    }}
                    className="mt-3 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer w-full min-w-0"
                  >
                    <span className="truncate">{tr("Chi tiết")}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded Pop-up Modal View (Full Screen / Detailed Dialog) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-white">
                      {tr("Chi Tiết Workmap & Lịch Phân Bổ Tải Học Tập")}
                    </h3>
                    <p className="text-xs text-blue-200 font-medium">
                      {tr("Xem toàn bộ môn học, bài tập được giao và theo dõi chỉ số tải LU theo từng ngày.")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Controls / Filters */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase">{tr("Lọc theo lớp:")}</span>
                    <select
                      value={modalFilterClass}
                      onChange={e => setModalFilterClass(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">{tr("Tất cả các lớp")}</option>
                      {classes?.map((c: string) => (
                        <option key={c} value={c}>{tr("Lớp")} {c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">{tr("Khoảng thời gian:")}</span>
                    <select
                      value={modalRangeDays}
                      onChange={e => setModalRangeDays(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value={7}>{tr("7 ngày tới")}</option>
                      <option value={14}>{tr("14 ngày tới")}</option>
                      <option value={30}>{tr("30 ngày tới")}</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-500 flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> {tr("An toàn (&lt;3.5 LU)")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" /> {tr("Vừa phải (3.5-5 LU)")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" /> {tr("Quá tải (&gt;5 LU)")}
                  </span>
                </div>
              </div>

              {/* Modal Body Scroll Area */}
              <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-160px)] custom-scrollbar">
                {Array.from({ length: modalRangeDays }).map((_, idx) => {
                  const dObj = addDays(today, idx);
                  const dStr = format(dObj, 'yyyy-MM-dd');
                  const entries = getEntriesForDate(dStr, modalFilterClass);
                  const totalLU = entries.reduce((sum, e) => sum + e.lu, 0);
                  const isOverloaded = totalLU > MAX_LU_PER_DAY;

                  return (
                    <div
                      key={dStr}
                      className={clsx(
                        "rounded-2xl p-5 border transition-all shadow-sm",
                        isOverloaded
                          ? "bg-rose-50/30 border-rose-200"
                          : "bg-white border-slate-200"
                      )}
                    >
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-extrabold flex flex-col items-center justify-center border border-blue-100 shrink-0">
                            <span className="text-[10px] uppercase">{format(dObj, 'MMM')}</span>
                            <span className="text-base leading-none">{format(dObj, 'd')}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-slate-900">
                                {getVietnameseDayName(dObj, false)}, {format(dObj, 'dd/MM/yyyy')}
                              </h4>
                              {isToday(dObj) && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                                  {tr("Hôm nay")}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {tr("Số môn giao:")} {entries.length} {tr("bài tập • Tổng thời gian:")} {entries.reduce((sum, e) => sum + e.minutes, 0)} {tr("phút")}
                            </p>
                          </div>
                        </div>

                        {/* LU Badge & Progress */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-slate-400 font-bold uppercase">{tr("Tổng LU ngày")}</div>
                            <div className={clsx(
                              "text-xl font-black font-sans",
                              isOverloaded ? "text-rose-600" : "text-blue-600"
                            )}>
                              {totalLU.toFixed(1)} <span className="text-xs text-slate-500 font-bold">/ 5.0 LU</span>
                            </div>
                          </div>

                          <div
                            className={clsx(
                              "px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 shrink-0",
                              isOverloaded
                                ? "bg-rose-100 text-rose-700 border-rose-200"
                                : totalLU > 3.5
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border-emerald-200"
                            )}
                          >
                            {isOverloaded ? (
                              <><AlertTriangle className="w-4 h-4 text-rose-600" /> {tr("Cảnh Báo Quá Tải")}</>
                            ) : totalLU > 3.5 ? (
                              tr("Tải Vừa Phải")
                            ) : (
                              <><CheckCircle2 className="w-4 h-4 text-emerald-600" /> {tr("Tải An Toàn")}</>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Entries Table / List */}
                      {entries.length === 0 ? (
                        <div className="text-xs font-semibold text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          {tr("Không có bài tập nào giao trong ngày này.")}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {entries.map((entry, eIdx) => {
                            const { subjectName, taskTitle, stepName, task } = getTaskInfo(entry);
                            const badgeStyle = getSubjectBadgeStyle(subjectName);

                            return (
                              <div
                                key={eIdx}
                                className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between hover:bg-white hover:shadow-md transition-all space-y-3"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className={clsx("px-2.5 py-1 rounded-lg text-xs font-extrabold border", badgeStyle)}>
                                      {subjectName}
                                    </span>
                                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                      {entry.lu.toFixed(1)} LU ({entry.minutes} {tr("phút)")}
                                    </span>
                                  </div>

                                  <h5 className="text-sm font-extrabold text-slate-900 leading-snug">
                                    {taskTitle}
                                  </h5>

                                  {stepName && (
                                    <div className="text-xs font-bold text-slate-600 mt-1 flex items-center gap-1">
                                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                                      <span>{tr("Bước thực hiện:")} <strong className="text-blue-700">{stepName}</strong></span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-slate-200/60">
                                  <span>{tr("Lớp:")} <strong className="text-slate-800">{task?.class_id || classId || '10A'}</strong></span>
                                  {task?.deadline && (
                                    <span className="flex items-center gap-1 text-slate-600">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {tr("Hạn nộp:")} {format(new Date(task.deadline), 'dd/MM/yyyy')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="text-xs font-bold text-slate-500">
                  {tr("ExamLoad Radar • Hệ thống tự động cân bằng tải cho Giáo viên & Học sinh")}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {tr("Đóng Workmap")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
