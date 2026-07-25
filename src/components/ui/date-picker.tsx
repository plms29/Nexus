'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  format, 
  parse, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addDays, 
  isToday 
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface DatePickerProps {
  value: string; // ISO date string 'yyyy-MM-dd'
  onChange: (dateString: string) => void;
  label?: string;
  minDate?: string;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Chọn ngày...',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect whether to open popover upward or downward based on viewport space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 350 && rect.top > 350) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Current selected date object
  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : new Date();

  // Month being viewed in popover
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate);

  // Sync currentMonth when value changes externally
  useEffect(() => {
    if (value) {
      const parsed = parse(value, 'yyyy-MM-dd', new Date());
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(parsed);
      }
    }
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar math
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleSelectDay = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleQuickPreset = (offsetDays: number) => {
    const newDate = addDays(new Date(), offsetDays);
    onChange(format(newDate, 'yyyy-MM-dd'));
    setCurrentMonth(newDate);
    setIsOpen(false);
  };

  const displayFormattedDate = value 
    ? format(selectedDate, 'dd/MM/yyyy') 
    : placeholder;

  return (
    <div className={clsx("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full border bg-white rounded-2xl px-4 py-3.5 text-left transition-all flex items-center justify-between shadow-sm border-slate-200 hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          isOpen && "ring-2 ring-blue-500/50 border-blue-500 shadow-md"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-900 font-extrabold text-sm tracking-wide">
              {displayFormattedDate}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {isToday(selectedDate) ? 'Hôm nay' : format(selectedDate, 'EEEE', { locale: vi })}
            </div>
          </div>
        </div>

        <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
          Chọn
        </div>
      </button>

      {/* Popover Calendar Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "absolute left-0 z-[100] w-full sm:w-[320px] bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl ring-1 ring-black/5",
              openUpward ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <span className="text-sm font-black text-slate-900 capitalize block">
                  {format(currentMonth, 'MMMM yyyy', { locale: vi })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentMonth(today);
                    onChange(format(today, 'yyyy-MM-dd'));
                    setIsOpen(false);
                  }}
                  className="px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 text-center mb-1 bg-slate-50 py-1.5 rounded-lg border border-slate-100">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                <div key={day} className="text-[11px] font-bold text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 mt-1">
              {daysGrid.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={clsx(
                      "h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer",
                      !isCurrentMonth && "text-slate-300 hover:text-slate-500",
                      isCurrentMonth && !isSelected && "text-slate-800 hover:bg-blue-50 hover:text-blue-600",
                      isSelected && "bg-blue-600 text-white font-black shadow-sm scale-105",
                      isCurrentDay && !isSelected && "border border-blue-500 text-blue-600 font-extrabold"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Quick Shortcuts */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Nhanh:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset(0)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors shrink-0"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(1)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors shrink-0"
              >
                +1 ngày
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(3)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors shrink-0"
              >
                +3 ngày
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(7)}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-colors shrink-0"
              >
                +1 tuần
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
