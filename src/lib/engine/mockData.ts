import { WorkmapEntry, Task } from './types';
import { addDays, format } from 'date-fns';

const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const mockWorkmapEntries: WorkmapEntry[] = [
  {
    date: formatDate(today),
    subject_group: 'natural',
    minutes: 60,
    lu: 2,
    task_id: 'task-1',
    step_name: 'Toán - Làm bài tập SGK'
  },
  {
    date: formatDate(today),
    subject_group: 'social',
    minutes: 45,
    lu: 1.5,
    task_id: 'task-2',
    step_name: 'Văn - Soạn bài'
  },
  {
    date: formatDate(addDays(today, 1)),
    subject_group: 'natural',
    minutes: 90,
    lu: 3,
    task_id: 'task-3',
    step_name: 'Lý - Vẽ biểu đồ'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Bài tập Toán đại số',
    type: 'short_exercise',
    class_id: 'class-10A',
    subject_id: 'sub-toan',
    deadline: formatDate(addDays(today, 1)),
    isGroup: false
  },
  {
    id: 'task-2',
    title: 'Soạn Văn',
    type: 'short_exercise',
    class_id: 'class-10A',
    subject_id: 'sub-van',
    deadline: formatDate(addDays(today, 1)),
    isGroup: false
  },
  {
    id: 'task-3',
    title: 'Vẽ biểu đồ dao động',
    type: 'chart',
    class_id: 'class-10A',
    subject_id: 'sub-ly',
    deadline: formatDate(addDays(today, 2)),
    isGroup: false
  }
];
