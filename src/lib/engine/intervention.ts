import { TaskAnalysis, Task } from './types';
import { isAtomicTask, isDecomposableTask } from './calculator';

export interface InterventionDecision {
  canDecompose: boolean;
  canMoveDeadline: boolean;
  strategy: 'move_day' | 'reduce_restructure' | 'schedule_steps' | 'reduce_scope_format';
  suggestions: string[];
}

export const decideIntervention = (
  task: Task,
  canMoveDeadline: boolean
): InterventionDecision => {
  const canDecompose = isDecomposableTask(task.type);

  if (!canDecompose && canMoveDeadline) {
    return {
      canDecompose,
      canMoveDeadline,
      strategy: 'move_day',
      suggestions: ['Chuyển toàn bộ bài sang ngày có workload trống.']
    };
  }

  if (!canDecompose && !canMoveDeadline) {
    return {
      canDecompose,
      canMoveDeadline,
      strategy: 'reduce_restructure',
      suggestions: [
        'Gộp các câu hỏi trùng nội dung.',
        'Giảm câu lặp.',
        'Cung cấp khung sơ đồ (scaffold).',
        'Đơn giản hóa phần xử lý số liệu.'
      ]
    };
  }

  if (canDecompose && canMoveDeadline) {
    return {
      canDecompose,
      canMoveDeadline,
      strategy: 'schedule_steps',
      suggestions: [
        'Chia nhỏ bài thành nhiều bước.',
        'Xếp lại lịch và đề xuất deadline mới xa hơn.'
      ]
    };
  }

  // canDecompose && !canMoveDeadline
  return {
    canDecompose,
    canMoveDeadline,
    strategy: 'reduce_scope_format',
    suggestions: [
      'Phân bổ lại thời gian các bước trong những ngày còn lại.',
      'Giảm phạm vi (scope) của bài.',
      'Đổi format bài tập.',
      'Chuyển từ làm cá nhân sang làm nhóm.'
    ]
  };
};
