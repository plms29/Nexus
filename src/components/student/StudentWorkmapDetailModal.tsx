'use client';

import { useTranslate, useDateLocale } from '@/lib/i18n';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Layers, 
  Filter,
  Play,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { format, addDays } from 'date-fns';
import { useStore } from '@/store/useStore';
import { Task } from '@/lib/engine/types';
import { normalizeClassId, resolveStudentClassId } from '@/lib/class-utils';

interface StudentWorkmapDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuizTask: (task: Task) => void;
  onSelectEssayTask: (task: any) => void;
}

export const StudentWorkmapDetailModal: React.FC<StudentWorkmapDetailModalProps> = ({
  isOpen,
  onClose,
  onSelectQuizTask,
  onSelectEssayTask
}) => {
  const tr = useTranslate();
  const dateLocale = useDateLocale();
  const { tasks, workmap, studentProfile, classes } = useStore();

  const studentClass = resolveStudentClassId(studentProfile.classId);
  const [selectedClass, setSelectedClass] = useState<string>(studentClass || '');

  useEffect(() => {
    if (studentClass) setSelectedClass(studentClass);
  }, [studentClass]);
  const [timeRange, setTimeRange] = useState<'1-past' | '7-days' | '14-days' | 'all'>('7-days');

  // Compute list of days based on filters
  const dayItems = useMemo(() => {
    if (!isOpen) return [];

    const today = new Date();
    const dates: Date[] = [];

    if (timeRange === '1-past') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      for (let i = 0; i < 5; i++) {
        const d = new Date(yesterday);
        d.setDate(yesterday.getDate() + i);
        dates.push(d);
      }
    } else if (timeRange === '14-days') {
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
      }
    } else if (timeRange === 'all') {
      const monday = new Date(today);
      monday.setDate(today.getDate() - 3);
      for (let i = 0; i < 10; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
      }
    } else {
      // 7-days default
      const currentDay = today.getDay(); // 0: Sun, 1: Mon...
      const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + distanceToMon);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
      }
    }

    return dates.map(d => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const monthAbbr = format(d, 'MMM', { locale: dateLocale }).toUpperCase();
      const dayNum = format(d, 'dd');
      const dayName = format(d, 'EEEE', { locale: dateLocale });
      const fullDateStr = format(d, 'dd/MM/yyyy');
      const isToday = dateStr === format(today, 'yyyy-MM-dd');

      // Filter workmap entries for this day
      const dayEntries = workmap.filter(w => {
        if (w.date !== dateStr) return false;
        if (selectedClass !== 'all') {
          const task = tasks.find(t => t.id === w.task_id);
          if (task && normalizeClassId(task.class_id) !== normalizeClassId(selectedClass)) return false;
        }
        return true;
      });

      const dayTasks: any[] = [];
      dayEntries.forEach((e, idx) => {
        const task = tasks.find(t => t.id === e.task_id);
        if (task) {
          dayTasks.push({
            entry: e,
            task,
            id: `${e.task_id}-${idx}`
          });
        }
      });

      // Include tasks with deadline matching this date if not added
      tasks.forEach(t => {
        if (selectedClass !== 'all' && normalizeClassId(t.class_id) !== normalizeClassId(selectedClass)) return;
        if (t.deadline === dateStr) {
          if (!dayTasks.some(dt => dt.task.id === t.id)) {
            dayTasks.push({
              entry: null,
              task: t,
              id: t.id
            });
          }
        }
      });

      const totalLU = dayEntries.reduce((sum, e) => sum + (Number(e.lu) || 0), 0);
      const totalMinutes = dayEntries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);

      return {
        dateObj: d,
        dateStr,
        monthAbbr,
        dayNum,
        dayName,
        fullDateStr,
        isToday,
        dayTasks,
        totalLU,
        totalMinutes
      };
    });
  }, [isOpen, timeRange, selectedClass, tasks, workmap]);

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
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-5xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10"
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  {tr("Chi Tiết Workmap & Lịch Phân Bổ Tải Học Tập")}
                </h2>
                <p className="text-[11px] sm:text-xs text-blue-200 font-semibold mt-1">
                  {tr("Xem toàn bộ môn học, bài tập được giao và theo dõi chỉ số tải LU theo từng ngày.")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar Controls */}
          <div className="bg-white px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-xs font-bold text-slate-700 w-full md:w-auto">
              {/* Class Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="shrink-0">{tr("LỌC:")}</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-auto flex-1"
                >
                  {studentClass && (
                    <option value={studentClass}>{tr("Lớp")} {studentClass}</option>
                  )}
                  <option value="all">{tr("Tất cả các lớp")}</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="shrink-0">{tr("THỜI GIAN:")}</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-auto flex-1"
                >
                  <option value="1-past">{tr("1 ngày qua")}</option>
                  <option value="7-days">{tr("7 ngày tới")}</option>
                  <option value="14-days">{tr("14 ngày tới")}</option>
                  <option value="all">{tr("Tất cả")}</option>
                </select>
              </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-extrabold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                {tr("An toàn (<3.5 LU)")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                {tr("Vừa phải (3.5-5 LU)")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                {tr("Quá tải (>5 LU)")}
              </span>
            </div>
          </div>

          {/* Scrollable Day Cards Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {dayItems.map((item) => {
              const isOverloaded = item.totalLU > 5.0;
              const isWarning = item.totalLU > 3.5 && item.totalLU <= 5.0;

              return (
                <div
                  key={item.dateStr}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 transition-all"
                >
                  {/* Day Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      {/* Date Badge Circle */}
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-black uppercase leading-none">{item.monthAbbr}</span>
                        <span className="text-lg font-black leading-none mt-0.5">{item.dayNum}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 capitalize">
                            {item.dayName}, {item.fullDateStr}
                          </h3>
                          {item.isToday && (
                            <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              {tr("Hôm nay")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          {tr("Số môn giao:")} {item.dayTasks.length} {tr("bài tập • Tổng thời gian:")} {item.totalMinutes} {tr("phút")}
                        </p>
                      </div>
                    </div>

                    {/* LU Workload Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase text-slate-400">{tr("TỔNG LU NGÀY")}</div>
                        <div className="text-base font-black text-slate-900">
                          <span className={clsx(
                            isOverloaded ? "text-rose-600" : isWarning ? "text-amber-600" : "text-blue-600"
                          )}>
                            {item.totalLU.toFixed(1)}
                          </span>
                          <span className="text-slate-400 text-xs"> / 5.0 LU</span>
                        </div>
                      </div>

                      <span className={clsx(
                        "px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5",
                        isOverloaded 
                          ? "bg-rose-50 text-rose-700 border-rose-200" 
                          : isWarning 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isOverloaded ? tr("Quá Tải") : isWarning ? tr("Tải Vừa Phải") : tr("Tải An Toàn")}
                      </span>
                    </div>
                  </div>

                  {/* Day Tasks List */}
                  {item.dayTasks.length === 0 ? (
                    <div className="py-4 text-center text-xs font-semibold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      {tr("Không có bài tập nào giao trong ngày này.")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.dayTasks.map(({ task, entry, id }) => (
                        <div
                          key={id}
                          onClick={() => {
                            if (task.type === 'quiz') {
                              onSelectQuizTask(task);
                            } else {
                              onSelectEssayTask(task);
                            }
                          }}
                          className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 cursor-pointer transition-all space-y-2 group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                              {tr(task.subject_id) || tr("Tin học")}
                            </span>
                            <span className="bg-white border border-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                              {entry?.lu ? `${entry.lu} LU (${entry.minutes} ${tr("phút")})` : task.type === 'quiz' ? '1.5 LU (45m)' : '2.5 LU (75m)'}
                            </span>
                          </div>

                          <div className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {tr(task.title)}
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>{tr("Lớp:")} {task.class_id}</span>
                            <span className="flex items-center gap-1 text-indigo-600 font-black">
                              <Clock className="w-3 h-3" />
                              {tr("Hạn nộp:")} {task.deadline || '25/07/2026'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-3 text-center sm:text-left">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 max-w-[250px] sm:max-w-none leading-tight">
              {tr("ExamLoad Radar • Hệ thống tự động cân bằng tải cho Giáo viên & Học sinh")}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm"
            >
              {tr("Đóng Workmap")}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
