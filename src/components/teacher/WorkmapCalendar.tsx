'use client';
import React from 'react';
import { useStore } from '@/store/useStore';
import { format, addDays, subDays, isSameDay, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Activity, BookOpen, AlertCircle } from 'lucide-react';
import { MAX_LU_PER_DAY } from '@/lib/engine/calculator';

export const WorkmapCalendar = ({ classId }: { classId: string }) => {
  const { workmap, tasks, selectedDate, setSelectedDate } = useStore();
  
  // Filter workmap for the selected class
  const classWorkmap = workmap.filter(entry => {
    const task = tasks.find(t => t.id === entry.task_id);
    return task?.class_id === classId;
  });
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    return format(d, 'yyyy-MM-dd');
  });

  return (
    <div className="glass-card rounded-3xl overflow-hidden p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-700 w-full relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-accent/20 transition-colors duration-1000"></div>
      
      <div className="mb-6 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Dự báo Workmap Tuần
        </h2>
        <p className="text-foreground/50 text-sm mt-1 font-medium">Tối đa 5 LU/ngày. Màu đỏ cảnh báo quá tải.</p>
      </div>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar">
        <div className="grid grid-cols-7 gap-[1px] bg-white/30 min-w-[650px]">
        {days.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const entries = classWorkmap.filter(e => e.date === dateStr);
          const totalLU = entries.reduce((sum, e) => sum + e.lu, 0);
          const isOverload = totalLU > MAX_LU_PER_DAY;
          
          return (
            <div 
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`p-1 sm:p-2 min-h-[120px] cursor-pointer transition-all duration-300 flex flex-col ${isSelected ? 'bg-primary/5 ring-2 ring-inset ring-primary z-10 scale-[1.02] shadow-xl rounded-lg relative' : 'bg-white/40 hover:bg-white/70 hover:scale-[1.01]'}`}
            >
              <div className="text-[9px] sm:text-[10px] font-bold mb-0.5 text-foreground/40 uppercase tracking-wider text-center">
                {format(new Date(dateStr), 'EEE')}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold mb-2 text-foreground/60 text-center">
                {format(new Date(dateStr), 'dd/MM')}
              </div>
              
              <div className={`text-lg sm:text-xl font-black font-sans tracking-tight mb-3 text-center ${isOverload ? 'text-destructive drop-shadow-sm' : 'text-primary'}`}>
                {totalLU.toFixed(1)} <span className="text-[9px] font-semibold text-foreground/50 tracking-normal uppercase">LU</span>
              </div>
              
              <div className="space-y-1.5 mt-auto">
                {entries.map((e, idx) => (
                  <div key={idx} className="text-[9px] p-1.5 rounded bg-white shadow-sm border border-black/5 font-medium flex flex-col gap-1 transition-transform hover:scale-105 overflow-hidden" title={e.step_name || e.task_id}>
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary w-fit">
                      {Number(e.lu).toFixed(1)} LU
                    </span>
                    <span className="line-clamp-2 leading-tight text-foreground/80 break-words">
                      {e.step_name || e.task_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
