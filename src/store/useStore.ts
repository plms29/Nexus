'use client';
import { create } from 'zustand';
import type { WorkmapEntry, Task } from '../lib/engine/types';
import { checkDailyOverload } from '../lib/engine/detector';
import type { OverloadResult } from '../lib/engine/detector';
import { decideIntervention } from '../lib/engine/intervention';
import type { InterventionDecision } from '../lib/engine/intervention';
import { format, addDays } from 'date-fns';
import { fetchTasks, fetchWorkmap, saveScheduledTask, updateTaskInDb, deleteTaskFromDb } from '../lib/api';
import { DEFAULT_CLASS_ID, normalizeClassId, normalizeClassList, resolveStudentClassId } from '../lib/class-utils';

interface User {
  username: string;
  role: 'teacher' | 'student' | 'admin';
  name: string;
}

export interface StudentProfile {
  name: string;
  classId: string;
  school: string;
  province: string;
  avatar: string;
  isOnboarded: boolean;
}

export interface QuizResult {
  taskId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
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
  classes: any[];
  subjects: any[];
  studentProfile: StudentProfile;
  quizResults: Record<string, QuizResult>;

  loadStudentData: () => Promise<void>;
  setStudentProfile: (profile: Partial<StudentProfile>) => void;
  addQuizResult: (result: QuizResult) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
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

export const useStore = create<AppState>((set, get) => ({
  workmap: [],
  tasks: [],
  auditLogs: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  overloadAlert: null,
  interventionProposal: null,
  user: null,
  activeTab: 'workmap',
  classes: [],
  subjects: [],
  studentProfile: {
    name: '',
    classId: '',
    school: '',
    province: '',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4',
    isOnboarded: false
  },
  quizResults: {},

  setStudentProfile: (profile) => {
    const normalizedProfile = profile.classId
      ? { ...profile, classId: normalizeClassId(profile.classId) }
      : profile;
    const newProfile = { ...get().studentProfile, ...normalizedProfile };
    set({ studentProfile: newProfile });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nexus_student_profile', JSON.stringify(newProfile));
      } catch (e) {}
    }
    if (profile.classId) {
      get().loadStudentData();
    }
  },

  addQuizResult: (result) => set(state => ({
    quizResults: { ...state.quizResults, [result.taskId]: result }
  })),

  addTask: (task: Task) => set((state: AppState) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    const res = await updateTaskInDb(taskId, updates);
    if (res.success) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }));
      return true;
    }
    return false;
  },

  deleteTask: async (taskId: string) => {
    const res = await deleteTaskFromDb(taskId);
    if (res.success) {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        workmap: state.workmap.filter(w => w.task_id !== taskId)
      }));
      return true;
    }
    return false;
  },

  addWorkmapEntry: (entry: WorkmapEntry) => set((state: AppState) => ({ workmap: [...state.workmap, entry] })),
  
  addAuditLog: (log) => set((state: AppState) => ({ auditLogs: [log, ...state.auditLogs] })),
  
  setSelectedDate: (date: string | null) => set({ selectedDate: date }),
  
  login: (user) => {
    set({ user, activeTab: 'workmap' });
  },
  
  logout: () => {
    set({ user: null, activeTab: 'workmap' });
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  clearAlert: () => set({ overloadAlert: null, interventionProposal: null }),
  
  loadData: async (classId?: string) => {
    const { supabase } = await import('../lib/supabase');
    const { fetchTeacherProfile } = await import('../lib/api');
    const { data: { user } } = await supabase.auth.getUser();
    
    let loadedClasses = [DEFAULT_CLASS_ID, '10A2', '11B1', '12A5'];
    let loadedSubjects = ['Ngữ văn', 'Toán', 'Vật lý', 'Hóa học', 'Tin học', 'Tiếng Anh'];

    if (user) {
      try {
        const profile = await fetchTeacherProfile(user.id);
        if (profile) {
          if (profile.classes && profile.classes.length > 0) {
            loadedClasses = normalizeClassList(profile.classes);
          }
          if (profile.subjects && profile.subjects.length > 0) loadedSubjects = profile.subjects;
        }
      } catch (e) {
        console.warn('Teacher profile check skipped:', e);
      }
    }

    set({ classes: loadedClasses, subjects: loadedSubjects });

    const tasks = await fetchTasks(classId);
    const workmap = await fetchWorkmap(classId);
    set({ tasks, workmap });
  },

  loadStudentData: async () => {
    const { supabase } = await import('../lib/supabase');
    const { fetchStudentProfile, fetchTasks, fetchWorkmap } = await import('../lib/api');
    
    let savedLocalProfile: StudentProfile | null = null;
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('nexus_student_profile');
        if (raw) savedLocalProfile = JSON.parse(raw);
      }
    } catch (e) {}

    const { data: { user } } = await supabase.auth.getUser();

    let activeProfile: StudentProfile = savedLocalProfile || get().studentProfile;

    if (user) {
      const profile = await fetchStudentProfile(user.id);
      if (profile && profile.isOnboarded) {
        activeProfile = { ...activeProfile, ...profile };
      } else {
        const metaClassId = normalizeClassId(user.user_metadata?.class_id);
        activeProfile = {
          ...activeProfile,
          name: user.user_metadata?.name || user.user_metadata?.full_name || activeProfile.name,
          avatar: user.user_metadata?.avatar || activeProfile.avatar,
          classId: activeProfile.classId || metaClassId,
          school: activeProfile.school || user.user_metadata?.school || '',
          province: activeProfile.province || user.user_metadata?.province || '',
          isOnboarded: false,
        };
      }
    }

    if (activeProfile && (activeProfile.isOnboarded || activeProfile.name)) {
      set({ studentProfile: activeProfile });
    }

    const targetClass = resolveStudentClassId(activeProfile.classId)
      || normalizeClassId(user?.user_metadata?.class_id);
    if (!targetClass) {
      set({ tasks: [], workmap: [] });
      return;
    }

    const tasks = await fetchTasks(targetClass);
    const workmap = await fetchWorkmap(targetClass);

    set({ tasks: tasks || [], workmap: workmap || [] });
  },
  
  autoScheduleTask: async (task: Task, startDate: string, deadline: string, totalMinutes: number, steps?: {name: string, lu: number, min: number, dayOffset: number}[]) => {
    const workmap = get().workmap;
    
    const dates = [];
    let curr = new Date(startDate);
    const end = new Date(deadline);
    while (curr <= end) {
      dates.push(format(curr, 'yyyy-MM-dd'));
      curr = addDays(curr, 1);
    }
    
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
          alert('Supabase Error: ' + (res.error?.message || 'Unknown error'));
        }
      } else {
        const overloadResult = checkDailyOverload(deadline, workmap, totalMinutes);
        const intervention = decideIntervention(task, true);
        const current_lu = overloadResult.totalLU - (totalMinutes / 30);
        set({ overloadAlert: { ...overloadResult, task, new_minutes: totalMinutes, current_lu, date: deadline }, interventionProposal: intervention });
      }
    } 
    else {
      const scheduledEntries: WorkmapEntry[] = [];
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
        const res = await saveScheduledTask(task, scheduledEntries);
        if (res.success) {
          get().addTask(task);
          scheduledEntries.forEach(entry => get().addWorkmapEntry(entry));
          set({ overloadAlert: null, interventionProposal: null });
        } else {
          alert('Supabase Error: ' + (res.error?.message || 'Unknown error'));
        }
      } else {
        const overloadResult = checkDailyOverload(deadline, workmap, totalMinutes);
        const intervention = decideIntervention(task, true);
        const current_lu = overloadResult.totalLU - (totalMinutes / 30);
        set({ overloadAlert: { ...overloadResult, task, new_minutes: totalMinutes, current_lu, date: deadline }, interventionProposal: intervention });
      }
    }
  }
}));
