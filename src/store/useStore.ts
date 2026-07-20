'use client';
import { create } from 'zustand';
import type { WorkmapEntry, Task } from '../lib/engine/types';
import { checkDailyOverload } from '../lib/engine/detector';
import type { OverloadResult } from '../lib/engine/detector';
import { decideIntervention } from '../lib/engine/intervention';
import type { InterventionDecision } from '../lib/engine/intervention';
import { format, addDays } from 'date-fns';
import { fetchTasks, fetchWorkmap, saveScheduledTask } from '../lib/api';

interface User {
  username: string;
  role: 'teacher' | 'student' | 'admin';
  name: string;
}

interface AppState {
  workmap: WorkmapEntry[];
  tasks: Task[];
  auditLogs: import('../lib/engine/types').AuditLog[];
  selectedDate: string | null;
  overloadAlert: (OverloadResult & { task: Task, new_minutes: number, current_lu: number, date: string }) | null;
  interventionProposal: InterventionDecision | null;
  user: User | null;
  activeTab: 'workmap' | 'assignments' | 'audit_logs';
  
  addTask: (task: Task) => void;
  addWorkmapEntry: (entry: WorkmapEntry) => void;
  addAuditLog: (log: import('../lib/engine/types').AuditLog) => void;
  setSelectedDate: (date: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  setActiveTab: (tab: 'workmap' | 'assignments' | 'audit_logs') => void;
  clearAlert: () => void;
  loadData: (classId?: string) => Promise<void>;
  autoScheduleTask: (task: Task, startDate: string, deadline: string, totalMinutes: number, steps?: {name: string, lu: number, min: number, dayOffset: number}[]) => Promise<void>;
}

// Load user from localStorage if exists
const loadUser = (): User | null => {
  try {
    const saved = localStorage.getItem('examload_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

export const useStore = create<AppState>((set, get) => ({
  workmap: [],
  tasks: [],
  auditLogs: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  overloadAlert: null,
  interventionProposal: null,
  user: loadUser(),
  activeTab: 'workmap',

  addTask: (task: Task) => set((state: AppState) => ({ tasks: [...state.tasks, task] })),
  
  addWorkmapEntry: (entry: WorkmapEntry) => set((state: AppState) => ({ workmap: [...state.workmap, entry] })),
  
  addAuditLog: (log) => set((state: AppState) => ({ auditLogs: [log, ...state.auditLogs] })),
  
  setSelectedDate: (date: string | null) => set({ selectedDate: date }),
  
  login: (user) => {
    localStorage.setItem('examload_user', JSON.stringify(user));
    set({ user, activeTab: 'workmap' });
  },
  
  logout: () => {
    localStorage.removeItem('examload_user');
    set({ user: null, activeTab: 'workmap' });
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  clearAlert: () => set({ overloadAlert: null, interventionProposal: null }),
  
  loadData: async (classId?: string) => {
    const tasks = await fetchTasks(classId);
    const workmap = await fetchWorkmap(classId);
    set({ tasks, workmap });
  },
  
  autoScheduleTask: async (task: Task, startDate: string, deadline: string, totalMinutes: number, steps?: {name: string, lu: number, min: number, dayOffset: number}[]) => {
    const workmap = get().workmap;
    
    // Generate dates between startDate and deadline
    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(deadline);
    while (curr <= end) {
      dates.push(format(curr, 'yyyy-MM-dd'));
      curr = addDays(curr, 1);
    }
    
    // For Atomic Task (no steps provided)
    if (!steps) {
      let scheduledDate = null;
      for (const d of dates) {
        const overloadResult = checkDailyOverload(d, workmap, totalMinutes);
        if (!overloadResult.isOverloaded) {
          scheduledDate = d;
          break;
        }
      }
      
      if (scheduledDate) {
        // Success! Schedule it.
        const entry = {
          date: scheduledDate,
          subject_group: 'natural' as const,
          minutes: totalMinutes,
          lu: totalMinutes / 30,
          task_id: task.id
        };
        const res = await saveScheduledTask(task, [entry]);
        if (res.success) {
          get().addTask(task);
          get().addWorkmapEntry(entry);
          set({ overloadAlert: null, interventionProposal: null });
        } else {
          alert('Failed to save to Supabase');
        }
      } else {
        // Overload on all possible days!
        const overloadResult = checkDailyOverload(deadline, workmap, totalMinutes);
        const intervention = decideIntervention(task, true);
        const current_lu = overloadResult.totalLU - (totalMinutes / 30);
        set({ overloadAlert: { ...overloadResult, task, new_minutes: totalMinutes, current_lu, date: deadline }, interventionProposal: intervention });
      }
    } 
    // For Decomposable Task (steps provided)
    else {
      let isFeasible = true;
      const scheduledEntries: WorkmapEntry[] = [];
      
      // Greedily schedule steps
      let stepIdx = 0;
      for (const d of dates) {
        if (stepIdx >= steps.length) break;
        
        let availableMinutes = 150 - checkDailyOverload(d, workmap, 0).totalLU * 30;
        
        while (stepIdx < steps.length && availableMinutes >= steps[stepIdx].min) {
          const step = steps[stepIdx];
          scheduledEntries.push({
            date: d,
            subject_group: 'natural' as const,
            minutes: step.min,
            lu: step.lu,
            task_id: task.id,
            step_name: step.name
          });
          availableMinutes -= step.min;
          stepIdx++;
        }
      }
      
      if (stepIdx === steps.length) {
        // Scheduled all steps!
        const res = await saveScheduledTask(task, scheduledEntries);
        if (res.success) {
          get().addTask(task);
          scheduledEntries.forEach(entry => get().addWorkmapEntry(entry));
          set({ overloadAlert: null, interventionProposal: null });
        } else {
          alert('Failed to save to Supabase');
        }
      } else {
        // Couldn't fit all steps
        const overloadResult = checkDailyOverload(deadline, workmap, totalMinutes);
        const intervention = decideIntervention(task, true);
        const current_lu = overloadResult.totalLU - (totalMinutes / 30);
        set({ overloadAlert: { ...overloadResult, task, new_minutes: totalMinutes, current_lu, date: deadline }, interventionProposal: intervention });
      }
    }
  }
}));

