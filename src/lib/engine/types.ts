export type TaskType = 'quiz' | 'chart' | 'mindmap_short' | 'short_exercise' | 'essay' | 'mindmap_long' | 'presentation_individual' | 'presentation_group' | 'project';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  class_id: string;
  subject_id: string;
  deadline: string; // ISO Date
  isGroup: boolean;
  topic?: string;
  learning_objectives?: string;
  outline?: { id: string; text: string }[];
  essay_steps?: { id: string; stepName: string; minutes: number; note: string }[];
  is_outline_approved?: boolean;
}

export interface TaskStep {
  step_name: string;
  estimated_minutes: number;
  estimated_LU: number;
  dependency?: string; // name of the previous step
  earliest_start_date: string; // ISO Date
  latest_finish_date: string; // ISO Date
  is_splittable: boolean;
}

export interface TaskAnalysis {
  task_type: TaskType;
  topic: string;
  learning_objectives: string;
  estimated_total_minutes: number;
  total_LU: number;
  task_breakdown: TaskStep[];
  suggested_daily_schedule: Record<string, number>; // Date -> LU
  overloaded_dates: string[];
  reason_for_overload: string;
  intervention_options: string[];
  learning_objectives_preserved: boolean;
  new_LU_after_adjustment?: number;
}

export type SubjectGroup = 'natural' | 'social';

export interface WorkmapEntry {
  date: string; // ISO Date
  subject_group: SubjectGroup;
  minutes: number;
  lu: number;
  task_id: string;
  step_name?: string;
}

export interface AuditLog {
  id?: string;
  timestamp: string;
  task_id: string;
  task_title?: string;
  teacher_id?: string;
  reason: string;
  severity: 'critical' | 'soft';
}
